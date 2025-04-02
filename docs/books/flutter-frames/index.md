---
outline: deep
---

## Flutter 一帧的变化

## 前言

Flutter 3.10.6 • channel stable • https://github.com/flutter/flutter.git
Framework • revision f468f3366c • 2023-07-12 15:19:05 -0700
Engine • revision cdbeda788a
Tools • Dart 3.0.6 • DevTools 2.23.1

我们从`setState`函数开始渐进式步入流程

`setState` 函数一般是用在 `StatefulWidget` 中

本文初始代码结构如下：

```dart
import 'package:flutter/material.dart';

class Frame extends StatefulWidget {
  const Frame({Key? key}) : super(key: key);

  @override
  State<Frame> createState() => _FrameState();
}

class _FrameState extends State<Frame> {
  int _count = 0;

  void _handleAdd() => setState(() => _count++);

  void _handleSub() => setState(() => _count++);

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      OutlinedButton(onPressed: _handleAdd, child: const Text("Add")),
      Text("$_count"),
      OutlinedButton(onPressed: _handleSub, child: const Text("Sub")),
    ]);
  }
}
```

## 开始

用户点击`Add`按钮后触发`onPressed`回调最终调用到`setState`函数

```dart
setState(() => _count++)
```

### 1.`State#setState`

```dart
@protected
void setState(VoidCallback fn) {
  final Object? result = fn() as dynamic;
  _element!.markNeedsBuild();
}
```

此函数会执行传递过来的回调，在此时在`State`上挂载的`_count`就已经更新了，只不过视图还没有刷新。

执行`markNeedsBuild`， 这是刷新视图方法， 保证我们更新的数据重新渲染上图。

`_element` 的类型是`Element`, `Element`实现了`BuildContext`，所以在`build`函数中我们得到的`context`其实就是`Element`。

```dart
abstract class Element extends DiagnosticableTree implements BuildContext {...}
```

### 2. `Element#markNeedsBuild`

```dart
void markNeedsBuild() {
  if (_lifecycleState != _ElementLifecycle.active) return;
  if (dirty) return;
  _dirty = true;
  owner!.scheduleBuildFor(this);
}
```

在此函数中判断了 `element`的生命周期状态。

`Element`一共有 4 个状态：

```dart
// Element生命周期
enum _ElementLifecycle {
  initial, // 初始状态
  active, // 激活状态
  inactive, // 未激活状态
  defunct, // 销毁状态
}
```

必须在 `active` 阶段才能继续进行，进而开始标记此 `element` 为 脏数据 `_dirty` ，方便`Flutter`刷新时会找有此标记的`element`进行更新，如果已经标记过了就直接终止了，防止重复刷新视图。

最后执行 `owner!.scheduleBuildFor`。

`owner` 的类型是 `BuildOwner`， 是管理 `element` 生命周期的一个类。

```dart
class BuildOwner {...}
```

### 3.BuildOwner#scheduleBuildFor

```dart
void scheduleBuildFor(Element element) {
  if (element._inDirtyList) {
    _dirtyElementsNeedsResorting = true;
    return;
  }
  if (!_scheduledFlushDirtyElements && onBuildScheduled != null) {
    _scheduledFlushDirtyElements = true;
    onBuildScheduled!();
  }
  _dirtyElements.add(element); // 加入到脏列表中
  element._inDirtyList = true; // 把此标记设置为true
}
```

在此函数中主要是标记一些属性，这些属性是为了方便判断更新时做的。

`_dirtyElementsNeedsResorting`：表示是否需要再次给此`element`排序，因为在构建时会有其他的`脏element`加入到`_dirtyElements`列表中。

`_scheduledFlushDirtyElements`：表示是否已调度冲刷脏列表。

`onBuildScheduled`：是在**应用初始化**的时候就已经赋值了，主要是一些回调的注册。

WidgetsBinding#initInstances

```dart
@override
void initInstances() {
  super.initInstances();
  _instance = this;
  // Initialization of [_buildOwner] has to be done after
  // [super.initInstances] is called, as it requires [ServicesBinding] to
  // properly setup the [defaultBinaryMessenger] instance.
  _buildOwner = BuildOwner();
  // 设置onBuildScheduled方法
  buildOwner!.onBuildScheduled = _handleBuildScheduled;
  platformDispatcher.onLocaleChanged = handleLocaleChanged;
  SystemChannels.navigation.setMethodCallHandler(_handleNavigationInvocation);
  platformMenuDelegate = DefaultPlatformMenuDelegate();
}
```

### 4.BuildOwner#onBuildScheduled

```dart
  void _handleBuildScheduled() {
    // If we're in the process of building dirty elements, then changes
    // should not trigger a new frame.
    assert(() {
      if (debugBuildingDirtyElements) {
        throw FlutterError.fromParts(<DiagnosticsNode>[
          ErrorSummary('Build scheduled during frame.'),
          ErrorDescription(
            'While the widget tree was being built, laid out, and painted, '
            'a new frame was scheduled to rebuild the widget tree.',
          ),
          ErrorHint(
            'This might be because setState() was called from a layout or '
            'paint callback. '
            'If a change is needed to the widget tree, it should be applied '
            'as the tree is being built. Scheduling a change for the subsequent '
            'frame instead results in an interface that lags behind by one frame. '
            'If this was done to make your build dependent on a size measured at '
            'layout time, consider using a LayoutBuilder, CustomSingleChildLayout, '
            'or CustomMultiChildLayout. If, on the other hand, the one frame delay '
            'is the desired effect, for example because this is an '
            'animation, consider scheduling the frame in a post-frame callback '
            'using SchedulerBinding.addPostFrameCallback or '
            'using an AnimationController to trigger the animation.',
          ),
        ]);
      }
      return true;
    }());
    ensureVisualUpdate();
  }
```

此函数中断言了当前的帧，如果我们**正在构建脏元素**，那么不应该触发**新的一帧**，应该在**当前帧**中完成。

然后执行 `ensureVisualUpdate`。

### 5.SchedulerBinding#ensureVisualUpdate

```dart
void ensureVisualUpdate() {
  switch (schedulerPhase) {
    case SchedulerPhase.idle:
    case SchedulerPhase.postFrameCallbacks:
      scheduleFrame();
      return;
    case SchedulerPhase.transientCallbacks:
    case SchedulerPhase.midFrameMicrotasks:
    case SchedulerPhase.persistentCallbacks:
      return;
  }
}
```

在此函数主要功能是判断**当前的 Flutter 调度是在哪个阶段**。

调度器一共有 5 个阶段的状态

```dart
// 调度器阶段
enum SchedulerPhase {
  idle, // 空闲阶段
  transientCallbacks, // 短暂阶段 （动画）
  midFrameMicrotasks, // 中间帧阶段 （承上启下）
  persistentCallbacks, // 构建布局与渲染阶段（持久）
  postFrameCallbacks, // 帧尾阶段
}
```

如果当前阶段是在`idle`或`postFrameCallbacks`时才会生成新的一帧。

如果是其他阶段就不进行处理，因为其他阶段的任务还没有处理完，就表示这一帧还没有结束。

所有的阶段是依次进行调用的。

然而如果我们自己设计生命周期的话，肯定会用到`await`来等待某一生命周期的完成。但是的话`Flutter`在执行时会通过`Engine`来执行**帧**或者**渲染**之类的操作，所以当前的状态就**不受函数内控制**了。在处理这些阶段时会通过回调来进行处理，后面会讲到。

### 6.SchedulerBinding#scheduleFrame

```dart
void scheduleFrame() {
  if (_hasScheduledFrame || !framesEnabled) return;
  ensureFrameCallbacksRegistered();
  platformDispatcher.scheduleFrame();
  _hasScheduledFrame = true;
}
```

此函数中判断当前帧是否在调度，已经**在调度中**或者**当前帧未激活**就终止生成新帧。

`_hasScheduledFrame`：是否正在调度中

`framesEnabled`：是否启动帧， 此函数由修改`AppLifecycleState` 生命周期时来一并控制的。

`AppLifecycleState`共有 4 个状态：

```dart
enum AppLifecycleState {
  resumed, // 应用程序处于活动状态，正在响应用户输入(用户正在使用程序)
  inactive, // 应用程序处于非活动状态，不接收用户输入（用户没有使用或聚焦程序，但是还是在前台）
  paused, // 应用程序当前不可见，不响应用户输入，但在后台运行（隐藏到任务栏/控制台中）
  detached, // 应用程序仍运行在 Flutter 引擎中，但已与任何主机视图分离（页面已经关闭了）
}
```

只有在可见的情况下`resumed`、`inactive`才会进行调度，在`paused`、`detached`情况下就不进行调度了。

SchedulerBinding#handleAppLifecycleStateChanged

```dart
@protected
@mustCallSuper
void handleAppLifecycleStateChanged(AppLifecycleState state) {
  _lifecycleState = state;
  switch (state) {
    case AppLifecycleState.resumed:
    case AppLifecycleState.inactive:
      _setFramesEnabledState(true);
    case AppLifecycleState.paused:
    case AppLifecycleState.detached:
      _setFramesEnabledState(false);
  }
}
```

SchedulerBinding#\_setFramesEnabledState

```dart
void _setFramesEnabledState(bool enabled) {
  if (_framesEnabled == enabled) {
    return;
  }
  _framesEnabled = enabled;
  if (enabled) {
    scheduleFrame();
  }
}
```

让我们回到`6.scheduleFrame`中继续执行。

`ensureFrameCallbacksRegistered` ：注册帧回调

`platformDispatcher.scheduleFrame` ：触发**Flutter 引擎**调度

`platformDispatcher`： 是**Flutter Engine**与**Scheduler**之间的交互接口，是主机操作系统最基本的接口

#### 6.1.SchedulerBinding#ensureFrameCallbacksRegistered

```dart
@protected
void ensureFrameCallbacksRegistered() {
  platformDispatcher.onBeginFrame ??= _handleBeginFrame;
  platformDispatcher.onDrawFrame ??= _handleDrawFrame;
}
```

此函数中向引擎注册了两个回调。

`onBeginFrame`：开始帧

`onDrawFrame`：绘制帧

让我们回到`6.scheduleFrame`中继续执行。

#### 6.2.ui.PlatformDispatcher#scheduleFrame

```dart
void scheduleFrame() => _scheduleFrame();

@Native<Void Function()>(symbol: 'PlatformConfigurationNativeApi::ScheduleFrame')
external static void _scheduleFrame();
```

此函数去调用`Flutter Engine`的`api`来触发一帧。

至此`scheduleFrame`注册回调等初始工作就做完了，等待 Flutter 引擎的调用。

让我们来看看在引擎中是如何触发调度的。

### 7.PlatformConfigurationNativeApi::ScheduleFrame

以下代码片段是 **Engine**方法调用图：

```c++
void PlatformConfigurationNativeApi::ScheduleFrame() {
  UIDartState::ThrowIfUIOperationsProhibited();
  UIDartState::Current()->platform_configuration()->client()->ScheduleFrame(); // entry
}
```

```c++
void RuntimeController::ScheduleFrame() {
  client_.ScheduleFrame(); // entry
}
```

```c++
void Engine::ScheduleFrame(bool regenerate_layer_tree) {
  animator_->RequestFrame(regenerate_layer_tree); // entry
}
```

```c++
void Animator::RequestFrame(bool regenerate_layer_tree) {
  if (regenerate_layer_tree) {
    TRACE_EVENT_ASYNC_BEGIN0("flutter", "Frame Request Pending", frame_request_number_);
    regenerate_layer_tree_ = true;
  }

  if (!pending_frame_semaphore_.TryWait()) return;

  // The AwaitVSync is going to call us back at the next VSync. However, we want
  // to be reasonably certain that the UI thread is not in the middle of a
  // particularly expensive callout. We post the AwaitVSync to run right after
  // an idle. This does NOT provide a guarantee that the UI thread has not
  // started an expensive operation right after posting this message however.
  // To support that, we need edge triggered wakes on VSync.
  task_runners_.GetUITaskRunner()->PostTask(
      [self = weak_factory_.GetWeakPtr()]() {
        if (!self) return;
        self->AwaitVSync(); // entry
      });
  frame_scheduled_ = true;
}
```

```c++
void Animator::AwaitVSync() {
  waiter_->AsyncWaitForVsync(
      [self = weak_factory_.GetWeakPtr()](std::unique_ptr<FrameTimingsRecorder> frame_timings_recorder) {
        if (self) {
          if (self->CanReuseLastLayerTree()) {
            self->DrawLastLayerTree(std::move(frame_timings_recorder));
          } else {
            self->BeginFrame(std::move(frame_timings_recorder)); // entry
          }
        }
      });
  if (has_rendered_) {
    delegate_.OnAnimatorNotifyIdle(dart_frame_deadline_);
  }
}
```

```c++
void Animator::BeginFrame(std::unique_ptr<FrameTimingsRecorder> frame_timings_recorder) {
  TRACE_EVENT_ASYNC_END0("flutter", "Frame Request Pending", frame_request_number_);
  frame_request_number_++;

  frame_timings_recorder_ = std::move(frame_timings_recorder);
  frame_timings_recorder_->RecordBuildStart(fml::TimePoint::Now());

  TRACE_EVENT_WITH_FRAME_NUMBER(frame_timings_recorder_, "flutter", "Animator::BeginFrame");
  while (!trace_flow_ids_.empty()) {
    uint64_t trace_flow_id = trace_flow_ids_.front();
    TRACE_FLOW_END("flutter", "PointerEvent", trace_flow_id);
    trace_flow_ids_.pop_front();
  }

  frame_scheduled_ = false;
  regenerate_layer_tree_ = false;
  pending_frame_semaphore_.Signal();

  if (!producer_continuation_) {
    // We may already have a valid pipeline continuation in case a previous
    // begin frame did not result in an Animator::Render. Simply reuse that
    // instead of asking the pipeline for a fresh continuation.
    producer_continuation_ = layer_tree_pipeline_->Produce();

    if (!producer_continuation_) {
      // If we still don't have valid continuation, the pipeline is currently
      // full because the consumer is being too slow. Try again at the next
      // frame interval.
      TRACE_EVENT0("flutter", "PipelineFull");
      RequestFrame();
      return;
    }
  }

  // We have acquired a valid continuation from the pipeline and are ready
  // to service potential frame.
  FML_DCHECK(producer_continuation_);
  const fml::TimePoint frame_target_time = frame_timings_recorder_->GetVsyncTargetTime();
  dart_frame_deadline_ = frame_target_time.ToEpochDelta();
  uint64_t frame_number = frame_timings_recorder_->GetFrameNumber();
  delegate_.OnAnimatorBeginFrame(frame_target_time, frame_number); // entry

  if (!frame_scheduled_ && has_rendered_) {
    // Wait a tad more than 3 60hz frames before reporting a big idle period.
    // This is a heuristic that is meant to avoid giving false positives to the
    // VM when we are about to schedule a frame in the next vsync, the idea
    // being that if there have been three vsyncs with no frames it's a good
    // time to start doing GC work.
    task_runners_.GetUITaskRunner()->PostDelayedTask(
        [self = weak_factory_.GetWeakPtr()]() {
          if (!self) { return; }
          auto now = fml::TimeDelta::FromMicroseconds(Dart_TimelineGetMicros());
          // If there's a frame scheduled, bail.
          // If there's no frame scheduled, but we're not yet past the last
          // vsync deadline, bail.
          if (!self->frame_scheduled_ && now > self->dart_frame_deadline_) {
            TRACE_EVENT0("flutter", "BeginFrame idle callback");
            self->delegate_.OnAnimatorNotifyIdle(now + fml::TimeDelta::FromMilliseconds(100));
          }
        },
        kNotifyIdleTaskWaitTime
    );
  }
}
```

```c++
void Shell::OnAnimatorBeginFrame(fml::TimePoint frame_target_time, uint64_t frame_number) {
  FML_DCHECK(is_setup_);
  FML_DCHECK(task_runners_.GetUITaskRunner()->RunsTasksOnCurrentThread());
  // record the target time for use by rasterizer.
  {
    std::scoped_lock time_recorder_lock(time_recorder_mutex_);
    latest_frame_target_time_.emplace(frame_target_time);
  }
  if (engine_) {
    engine_->BeginFrame(frame_target_time, frame_number); // entry
  }
}
```

```c++
void Engine::BeginFrame(fml::TimePoint frame_time, uint64_t frame_number) {
  runtime_controller_->BeginFrame(frame_time, frame_number); // entry
}
```

```c++
bool RuntimeController::BeginFrame(fml::TimePoint frame_time, uint64_t frame_number) {
  if (auto* platform_configuration = GetPlatformConfigurationIfAvailable()) {
    platform_configuration->BeginFrame(frame_time, frame_number); // entry
    return true;
  }

  return false;
}
```

```c++
void PlatformConfiguration::BeginFrame(fml::TimePoint frameTime, uint64_t frame_number) {
  std::shared_ptr<tonic::DartState> dart_state = begin_frame_.dart_state().lock();
  if (!dart_state) return;

  tonic::DartState::Scope scope(dart_state);

  int64_t microseconds = (frameTime - fml::TimePoint()).ToMicroseconds();

  // 调用dart#onBeginFrame方法
  tonic::CheckAndHandleError(
      tonic::DartInvoke(begin_frame_.Get(), {
                                                Dart_NewInteger(microseconds),
                                                Dart_NewInteger(frame_number),
                                            }));

  UIDartState::Current()->FlushMicrotasksNow();
  // 调用dart#onDrawFrame方法
  tonic::CheckAndHandleError(tonic::DartInvokeVoid(draw_frame_.Get()));
}
```

通过一系列的 C/C++代码调用，最终锁定到上面的代码，请注意两个方法

`tonic::DartInvoke(begin_frame_.Get(), ...)`： 调用 `platformDispatcher.onBeginFrame`

`tonic::DartInvoke(draw_frame_.Get())`：调用`platformDispatcher.onDrawFrame`

这两个方法就是调用之前我们在`6.1.ensureFrameCallbacksRegistered`中注册的两个帧回调， 首先触发**开始帧**，然后触发**绘制帧**。

### 8.SchedulerBinding#\_handleBeginFrame

```dart
void _handleBeginFrame(Duration rawTimeStamp) {
  if (_warmUpFrame) {
    // "begin frame" and "draw frame" must strictly alternate. Therefore
    // _rescheduleAfterWarmUpFrame cannot possibly be true here as it is
    // reset by _handleDrawFrame.
    assert(!_rescheduleAfterWarmUpFrame);
    _rescheduleAfterWarmUpFrame = true;
    return;
  }
  handleBeginFrame(rawTimeStamp);
}
```

该函数判断是否是**预热帧**，然后再处理**开始帧**。

开始帧的主要作用就是处理一些动画的操作，比如处理一些`Ticker`, `AnimationController`的状态之类的。

`_warmUpFrame`：预热帧（热加载）

注意此`_warmUpFrame`预热帧是在**初始化或者热加载**的时候设置的，因为在此时是不需要进行处理开始帧的，也就是说此时是**不需要进行动画的更新操作的**，可以**直接进行绘制帧**。但是我们这里不是初始化或者热加载，所以继续执行。

### 9.SchedulerBinding#handleBeginFrame

```dart
void handleBeginFrame(Duration? rawTimeStamp) {
  _frameTimelineTask?.start('Frame');
  _firstRawTimeStampInEpoch ??= rawTimeStamp;
  _currentFrameTimeStamp = _adjustForEpoch(rawTimeStamp ?? _lastRawTimeStamp);
  if (rawTimeStamp != null) {
    _lastRawTimeStamp = rawTimeStamp;
  }
  assert(schedulerPhase == SchedulerPhase.idle);
  _hasScheduledFrame = false;
  try {
    // TRANSIENT FRAME CALLBACKS
    _frameTimelineTask?.start('Animate');
    _schedulerPhase = SchedulerPhase.transientCallbacks;
    final Map<int, _FrameCallbackEntry> callbacks = _transientCallbacks;
    _transientCallbacks = <int, _FrameCallbackEntry>{};
    callbacks.forEach((int id, _FrameCallbackEntry callbackEntry) {
      if (!_removedIds.contains(id)) {
        _invokeFrameCallback(callbackEntry.callback, _currentFrameTimeStamp!, callbackEntry.debugStack);
      }
    });
    _removedIds.clear();
  } finally {
    _schedulerPhase = SchedulerPhase.midFrameMicrotasks;
  }
}
```

此函数中主要是执行注册在`_transientCallbacks`的回调并修改`SchedulerPhase`当前调度阶段。

`_frameTimelineTask`： 表示帧的时间线任务状态，发布版本是没有的，只是调试的时候用，所有这里不做讨论。

紧接着断言当前调度阶段必须为`idle`,才能继续往下执行，因为这里是一帧的初始阶段。

这里从`idel`阶段进阶到`transientCallbacks`阶段并调用所有在此阶段注册的回调，并清空该回调列表。

这些回调就是处理一些`Ticker`的状态。

比如 `AnimationController` 的 `vsync` 参数，是为了让 `AnimationController` 内部使用 `Ticker` 对象来驱动动画的播放，因为在进行动画时需要知道当前帧的情况，然后通过`tick`回调进行动画数值的修改。

最后从`transientallbacks`阶段进阶`midFrameMicrotasks`阶段。

在`midFrameMicrotasks`阶段目前没有任何回调，仅作为连接开始帧与渲染帧的中间帧。

至此**开始帧**就结束了，在开始帧阶段系统就把所有需要更新的动画更新到新的状态， 紧接着开始调用**渲染帧**。

### 10.SchedulerBinding#\_handleDrawFrame

```dart
void _handleDrawFrame() {
  if (_rescheduleAfterWarmUpFrame) {
    _rescheduleAfterWarmUpFrame = false;
    // Reschedule in a post-frame callback to allow the draw-frame phase of
    // the warm-up frame to finish.
    addPostFrameCallback((Duration timeStamp) {
      // Force an engine frame.
      //
      // We need to reset _hasScheduledFrame here because we cancelled the
      // original engine frame, and therefore did not run handleBeginFrame
      // who is responsible for resetting it. So if a frame callback set this
      // to true in the "begin frame" part of the warm-up frame, it will
      // still be true here and cause us to skip scheduling an engine frame.
      _hasScheduledFrame = false;
      scheduleFrame();
    });
    return;
  }
  handleDrawFrame();
}
```

在此函数中判断是否需要重新调度，此判断是在之前`beginFrame`函数中与`_warmUpFrame`配套使用的。

### 11.SchedulerBinding#handleDrawFrame

```dart
void handleDrawFrame() {
  assert(_schedulerPhase == SchedulerPhase.midFrameMicrotasks);
  _frameTimelineTask?.finish(); // end the "Animate" phase
  try {
    // PERSISTENT FRAME CALLBACKS
    _schedulerPhase = SchedulerPhase.persistentCallbacks;

    for (final FrameCallback callback in _persistentCallbacks) {
      _invokeFrameCallback(callback, _currentFrameTimeStamp!);
    }

    // POST-FRAME CALLBACKS
    _schedulerPhase = SchedulerPhase.postFrameCallbacks;
    final List<FrameCallback> localPostFrameCallbacks =
      List<FrameCallback>.of(_postFrameCallbacks);
    _postFrameCallbacks.clear();

    for (final FrameCallback callback in localPostFrameCallbacks) {
      _invokeFrameCallback(callback, _currentFrameTimeStamp!);
    }
  } finally {
    _schedulerPhase = SchedulerPhase.idle;
    _frameTimelineTask?.finish(); // end the Frame
    _currentFrameTimeStamp = null;
  }
}
```

此函数主要是处理两个列表：

- `_persistentCallbacks`： 持久回调列表，处理构建、布局、渲染等
- `_postFrameCallbacks`：帧尾回调列表

在函数开始就断言了当前调度阶段必须为`midFrameMicrotasks`，代表是我是从**开始帧**结束后切换过来的，只能**交叉**的调用。

从`midFrameMicrotasks`阶段变成`persistentCallbacks`阶段并调用此阶段所有注册的回调。

回调完成后并没有与`transientCallbacks`一样清空回调，而是**持久保存**下来，下一帧的时候又会调用，因为此回调在每次进行一帧的调用时都会进行构建渲染`Widget`等操作，如果取消的话下帧又要重新注册进来，影响性能，所以收益不大。

有一些回调是跟随着`RendererBinding`初始化进行添加的：

RendererBinding#initInstances

```dart
void initInstances() {
  super.initInstances();
  _instance = this;

  _pipelineOwner = PipelineOwner(
    onSemanticsOwnerCreated: _handleSemanticsOwnerCreated,
    onSemanticsUpdate: _handleSemanticsUpdate,
    onSemanticsOwnerDisposed: _handleSemanticsOwnerDisposed,
  );

  platformDispatcher
    ..onMetricsChanged = handleMetricsChanged
    ..onTextScaleFactorChanged = handleTextScaleFactorChanged
    ..onPlatformBrightnessChanged = handlePlatformBrightnessChanged;

  initRenderView();

  addPersistentFrameCallback(_handlePersistentFrameCallback); // 添加到列表

  initMouseTracker();

  if (kIsWeb) {
    addPostFrameCallback(_handleWebFirstFrame);
  }
  _pipelineOwner.attach(_manifold);
}
```

让我们看看是如果进行处理的。

### 12.RendererBinding#\_handlePersistentFrameCallback

```dart
void _handlePersistentFrameCallback(Duration timeStamp) {
  drawFrame();
  _scheduleMouseTrackerUpdate();
}
```

**注意**：此函数中看似调用了当前`RendererBinding`的`drawFrame`方法，其实在应用初始化`WidgetsFlutterBinding`时在`WidgetsBinding`中重写了此方法：

```dart
class WidgetsFlutterBinding extends BindingBase with GestureBinding, SchedulerBinding, ServicesBinding, PaintingBinding, SemanticsBinding, RendererBinding, WidgetsBinding {
  /// Returns an instance of the binding that implements
  /// [WidgetsBinding]. If no binding has yet been initialized, the
  /// [WidgetsFlutterBinding] class is used to create and initialize
  /// one.
  ///
  /// You only need to call this method if you need the binding to be
  /// initialized before calling [runApp].
  ///
  /// In the `flutter_test` framework, [testWidgets] initializes the
  /// binding instance to a [TestWidgetsFlutterBinding], not a
  /// [WidgetsFlutterBinding]. See
  /// [TestWidgetsFlutterBinding.ensureInitialized].
  static WidgetsBinding ensureInitialized() {
    if (WidgetsBinding._instance == null) {
      WidgetsFlutterBinding();
    }
    return WidgetsBinding.instance;
  }
}
```

### 13.WidgetsBinding#drawFrame

```dart
@override
void drawFrame() {
  TimingsCallback? firstFrameCallback;
  if (_needToReportFirstFrame) {
    firstFrameCallback = (List<FrameTiming> timings) {
      SchedulerBinding.instance.removeTimingsCallback(firstFrameCallback!);
      firstFrameCallback = null;
      _firstFrameCompleter.complete();
    };
    // Callback is only invoked when FlutterView.render is called. When
    // sendFramesToEngine is set to false during the frame, it will not be
    // called and we need to remove the callback (see below).
    SchedulerBinding.instance.addTimingsCallback(firstFrameCallback!);
  }

  try {
    if (rootElement != null) {
      buildOwner!.buildScope(rootElement!); // 重新构建脏列表
    }
    super.drawFrame(); // 绘制上图
    buildOwner!.finalizeTree(); // 卸载不必要的element
  } finally {}
  _needToReportFirstFrame = false;
  if (firstFrameCallback != null && !sendFramesToEngine) {
    // This frame is deferred and not the first frame sent to the engine that
    // should be reported.
    _needToReportFirstFrame = true;
    SchedulerBinding.instance.removeTimingsCallback(firstFrameCallback!);
  }
}
```

此函数中判断了**首帧**处理的情况并且`addTimingsCallback`添加的回调在 `FlutterView.render` 调用时被回调，一般用于性能监控等。

此函数最为重要的 3 个方法：

`buildOwner!.buildScope(rootElement!)`： 重新构建脏列表

`super.drawFrame()`：绘制上图

`buildOwner!.finalizeTree()`：卸载不必要的 `element`

`rootElement`： 在`runApp`中传递的`Widget`的`element`， 正常情况下都会存在的

#### 13.1.buildOwner#buildScope

```dart
@pragma('vm:notify-debugger-on-exception')
  void buildScope(Element context, [ VoidCallback? callback ]) {
    if (callback == null && _dirtyElements.isEmpty) return;

    try {
      _scheduledFlushDirtyElements = true;
      if (callback != null) {
        Element? debugPreviousBuildTarget;
        _dirtyElementsNeedsResorting = false;
        try {
          callback();
        } finally {...}
      }
      _dirtyElements.sort(Element._sort);
      _dirtyElementsNeedsResorting = false;
      int dirtyCount = _dirtyElements.length;
      int index = 0;
      while (index < dirtyCount) {
        final Element element = _dirtyElements[index];

        try {
          element.rebuild();
        } catch (e, stack) {...}
        index += 1;
        if (dirtyCount < _dirtyElements.length || _dirtyElementsNeedsResorting!) {
          _dirtyElements.sort(Element._sort);
          _dirtyElementsNeedsResorting = false;
          dirtyCount = _dirtyElements.length;
          while (index > 0 && _dirtyElements[index - 1].dirty) {
            index -= 1;
          }
        }
      }
    } finally {
      for (final Element element in _dirtyElements) {
        assert(element._inDirtyList);
        element._inDirtyList = false;
      }
      _dirtyElements.clear();
      _scheduledFlushDirtyElements = false;
      _dirtyElementsNeedsResorting = null;
    }
  }
```

此函数中以**深度遍历**的方式处理标记为脏的`element`列表。

要保证更新`element`列表时，不能存在相互依赖，因为这次依赖会导致无限循环，所以使用**深度遍历**的排序来保证最小作用域。

通过调用`element`的`rebuild`方法进行构建。

```dart
 @pragma('vm:prefer-inline')
  void rebuild({bool force = false}) {
    if (_lifecycleState != _ElementLifecycle.active || (!_dirty && !force)) return;
    assert(_lifecycleState == _ElementLifecycle.active);
    try {
      performRebuild();
    } finally {...}
    assert(!_dirty);
  }
```

此函数首先经过了一系列的判断与断言，保证了在重建的时候此`element`是`active`的状态，然后调用`performRebuild`方法进行重建。

```dart
@protected
@mustCallSuper
void performRebuild() {
  _dirty = false;
}
```

在`Element`基类中仅修改了`dirty`的状态，所有`Element`子类都**直接或间接继承**此`Elemnt`，所以根据不同的`Element`子类都有不同的重建规则。

在这里我们举例 `StatefulElement`：

继承关系为：`StatefulElement => ComponentElement => Element`。

StatefulElement#performRebuild

```dart
@override
void performRebuild() {
  if (_didChangeDependencies) {
    state.didChangeDependencies();
    _didChangeDependencies = false;
  }
  super.performRebuild();
}
```

在`performRebuild`中判断**祖先级的结构**是否有变化，有变化触发`didChangeDependencies`方法。

调用父级的`performRebuild`方法，`StatefulElement`继承自`ComponentElement`。

```dart
@override
@pragma('vm:notify-debugger-on-exception')
void performRebuild() {
  Widget? built;
  try {
    built = build();
  } catch (e, stack) {...}
  finally {
    // We delay marking the element as clean until after calling build() so
    // that attempts to markNeedsBuild() during build() will be ignored.
    super.performRebuild(); // clears the "dirty" flag
  }
  try {
    _child = updateChild(_child, built, slot);
  } catch (e, stack) {...}
}
```

在函数中调用了`build`进行构建当前的`Widget`。

构建完成后调用父级`Element`清除`dirty`的状态。

然后通过`updateChild`更新后来设置`_child`， 这个`_child`是新生成的`Widget`的`element`，并不是自身的`element`， 即此\_`child`是子级的`element`。

来看看`updateChild`是如何更新的：

##### 13.1.1.Element#updateChild

```dart
@protected
@pragma('vm:prefer-inline')
Element? updateChild(Element? child, Widget? newWidget, Object? newSlot) {
  if (newWidget == null) {
    if (child != null) deactivateChild(child); // 分离当前的element。
    return null;
  }

  final Element newChild;

  if (child != null) {
    bool hasSameSuperclass = true;
    if (hasSameSuperclass && child.widget == newWidget) {
      if (child.slot != newSlot) {
        updateSlotForChild(child, newSlot);
      }
      newChild = child;
    } else if (hasSameSuperclass && Widget.canUpdate(child.widget, newWidget)) {
      if (child.slot != newSlot) {
        updateSlotForChild(child, newSlot);
      }
      child.update(newWidget);
      newChild = child;
    } else {
      deactivateChild(child);
      newChild = inflateWidget(newWidget, newSlot);
    }
  } else {
    newChild = inflateWidget(newWidget, newSlot);
  }

  return newChild;
}
```

这个函数主要是通过`旧的child`生成`新的child`， 类型是`Element`。

`deactivateChild`：分离当前的 element。

Element#deactivateChild

```dart
@protected
void deactivateChild(Element child) {
  child._parent = null;
  child.detachRenderObject();
  owner!._inactiveElements.add(child); // this eventually calls child.deactivate()
}
```

把父级解除后，加入到了`_inactiveElements`列表，这个列表主要是一些**未激活 element**列表，最后会统一卸载掉。

我们回到`updateChild`中。

它在函数中进行一些构建的判断：

- 父节点相同 并且 旧 widget 与新 widget 相同

如果插槽不同，那么更新插槽。

`slot`：插槽， 确定子节点在父节点的子节点列表中的位置信息。

然后把旧的`child`赋值给`newChild`。

- 父节点相同 并且 Widget 可以更新

`Widget.canUpdate`： 只判断两个 Widget 的 runtimeType 与 key 是否相等。

Widget#Widget.canUpdate

```dart
static bool canUpdate(Widget oldWidget, Widget newWidget) {
  return oldWidget.runtimeType == newWidget.runtimeType
    && oldWidget.key == newWidget.key;
}
```

接着往下走。

如果插槽不同，就更新插槽；

通过`child.update`方法更新新的`widget`，`Widget`就相当于`Element`的配置。

```dart
@override
void update(StatefulWidget newWidget) {
  super.update(newWidget);
  final StatefulWidget oldWidget = state._widget!;
  state._widget = widget as StatefulWidget;
  final Object? debugCheckForReturnedFuture = state.didUpdateWidget(oldWidget) as dynamic;
  rebuild(force: true);
}
```

Element#update

```dart
@mustCallSuper
void update(covariant Widget newWidget) {
  _widget = newWidget;
}
```

用新的`widget`配置替换旧的`widget`， 这里替换的是`element`的`widget`。

`state._widget = widget`：接着使用新的`widget`替换`state`的`widget`。

然后调用`state.didUpdateWidget`，通知这个`widget`已经被更新了。

在`state.didUpdateWidget`中只能访问新的`widget`，因为其他都没有更新完，所以在这里回调调用一些`element`的操作会报错，一般会把这些操作放到**帧尾**来使用，通过`addPostFrameCallback`添加。

然后把旧的`child`赋值给`newChild`，因为在此判断中`child`与`newChild`是相等的。

其余的情况最后都是通过`inflateWidget`方法生成新的`child`赋值给`newChild`。

Element#inflateWidget

```dart
@protected
@pragma('vm:prefer-inline')
Element inflateWidget(Widget newWidget, Object? newSlot) {
  try {
    final Key? key = newWidget.key;
    if (key is GlobalKey) {
      final Element? newChild = _retakeInactiveElement(key, newWidget);
      if (newChild != null) {
        newChild._activateWithParent(this, newSlot);
        final Element? updatedChild = updateChild(newChild, newWidget, newSlot);
        return updatedChild!;
      }
    }
    final Element newChild = newWidget.createElement();
    newChild.mount(this, newSlot);
    return newChild;
  } finally {...}
}
```

简单来说这个函数就是，通过`widget`配置生成`element`并挂载。

首先判断这个`key`是否是`GlobalKey`，如果是那就不走正常流程了，因为我们知道可以通过`GlobalKey`可以进行`element`实例的访问，比如说是`Context`或`State`等。

首先判断这个`key`是否是`GlobalKey`，如果是那就尝试通过`_retakeInactiveElement`来获取`element`。

```dart
 Element? _retakeInactiveElement(GlobalKey key, Widget newWidget) {
    // The "inactivity" of the element being retaken here may be forward-looking: if
    // we are taking an element with a GlobalKey from an element that currently has
    // it as a child, then we know that element will soon no longer have that
    // element as a child. The only way that assumption could be false is if the
    // global key is being duplicated, and we'll try to track that using the
    // _debugTrackElementThatWillNeedToBeRebuiltDueToGlobalKeyShenanigans call below.
    final Element? element = key._currentElement;
    if (element == null)  return null;
    if (!Widget.canUpdate(element.widget, newWidget)) return null;
    final Element? parent = element._parent;
    if (parent != null) {
      parent.forgetChild(element);
      parent.deactivateChild(element);
    }
    owner!._inactiveElements.remove(element);
    return element;
  }
```

在此函数中，通过`key`的`currentElement`方法来获取注册在`buildOwner`中`_globalKeyRegistry`的`element`。

如果`element`**不存在**或者**不可以使用**的话就直接返回`null`，就不通过这个方法来获取了。

如果`parent`存在那么就切断此`element`与`parent`的联系，此时`element`的**父级可能已经发生了改变**，这个`element`可能是从`_inactiveElements`中取出来的。

最后从当前所有者`_inactiveElements`中移除此`element`，然后返回此`element`。

回到上一层函数中，判断`_retakeInactiveElement`返回的`element`是否存在。存在的话就接着执行`_activateWithParent`。

Element#\_activateWithParent

```dart
void _activateWithParent(Element parent, Object? newSlot) {
  assert(_lifecycleState == _ElementLifecycle.inactive);
  _parent = parent;
  _updateDepth(_parent!.depth);
  _activateRecursively(this);
  attachRenderObject(newSlot);
  assert(_lifecycleState == _ElementLifecycle.active);
}
```

在函数中设置它的父级，更新它的深度，递归激活子级，附着`RenderObject`。

执行完后，回到上层代码中，通过`updateChild`更新此`element`，最后返回它。

因为是`GlobalKey`所以注册在`owner`中是可以找到的，所以在这里是复用操作。

其他非`GlobalKey`就通过`createElement`创建新的`element`并调用`mout`进行挂载。

`StatefulElement`中并没有重写这个方法，但是它的父类`ComponentElement`重写了。

ComponentElement#mout

```dart
@override
void mount(Element? parent, Object? newSlot) {
  super.mount(parent, newSlot);
  assert(_child == null);
  assert(_lifecycleState == _ElementLifecycle.active);
  _firstBuild();
  assert(_child != null);
}
```

它这里又调用了父级`Element`的`mount`。

Element#mount

```dart
@mustCallSuper
void mount(Element? parent, Object? newSlot) {
  _parent = parent;
  _slot = newSlot;
  _lifecycleState = _ElementLifecycle.active;
  _depth = _parent != null ? _parent!.depth + 1 : 1;
  if (parent != null) {
    // Only assign ownership if the parent is non-null. If parent is null
    // (the root node), the owner should have already been assigned.
    // See RootRenderObjectElement.assignOwner().
    _owner = parent.owner;
  }
  assert(owner != null);
  final Key? key = widget.key;
  if (key is GlobalKey) {
    owner!._registerGlobalKey(key, this);
  }
  _updateInheritance();
  attachNotificationTree();
}
```

在函数中就就是初始化 **父类、插槽、生命周期、组件深度、所有者**。

如果`key`是`GlobalKey`，就向`owner`的`globalKey`列表中注册该`element`。

调用`_updateInheritance`更新`_inheritedElements`：

```dart
void _updateInheritance() {
  assert(_lifecycleState == _ElementLifecycle.active);
  _inheritedElements = _parent?._inheritedElements;
}
```

调用`attachNotificationTree`更新`_notificationTree`：

```dart
@protected
void attachNotificationTree() {
  _notificationTree = _parent?._notificationTree;
}
```

`Element#mount`执行完后，继续执行`_firstBuild`， 然后执行`rebuild`。

```dart
void _firstBuild() {
  // StatefulElement overrides this to also call state.didChangeDependencies.
  rebuild(); // This eventually calls performRebuild.
}
```

至此`mount`方法就执行完了。

让我们回到 `inflateWidget`中。

返回当前的已经挂载好的`element`，让我们再回到`updateChild`中。

把这个已经挂载好的`element`赋值给当前`element`的`_child`中。

至此`element.rebuild`就完成了，总的来说可以知晓这是一个更新子`child`的操作。

让我们回到 13.1.`buildOwner!.buildScope`中继续执行。

在代码后又继续判断`_dirtyElements`列表，因为在构建的时候可能会出现新的`dirty`加入到列表，所以需要在这里一并进行更新。

等这些`dirty`列表更新完成后，清除`dirty`列表。

到这里`buildScope`的功能就完成了，主要是`Widget`与`Element`的构建

下面回到`13.WidgetsBinding.drawFrame`继续执行。

#### 13.2.RendererBinding#drawFrame

![image-20230719165701133](/Users/liuyang/Library/Application Support/typora-user-images/image-20230719165701133.png)

此函数是绘制作用。

`flushLayout`：冲刷布局（Layout）

`flushCompositingBits`：冲刷合成位，是管线的一部分，在`flushLayout`与`flushPaint`之间

`flushPaint`：冲刷绘制（Paint）

`compositeFrame`：合成帧（渲染上图）

`flushSemantics`：冲刷语义化

`PipelineOwner`：管线所有者，是`RenderBinding`中的渲染树所有者，维护着一些`dirty`状态，随着`RenderBinding`初始化一起初始

`renderView`：`PipelineOwner`的`rootNode`，是渲染树的根，在`RenderBinding`中是作为`RenderView`类型，也随着`RenderBinding`初始化一起初始。

##### 13.2.1.PipelineOwner#flushLayout

```dart
void flushLayout() {
  try {
    while (_nodesNeedingLayout.isNotEmpty) {
      final List<RenderObject> dirtyNodes = _nodesNeedingLayout;
      _nodesNeedingLayout = <RenderObject>[];
      dirtyNodes.sort((RenderObject a, RenderObject b) => a.depth - b.depth);
      for (int i = 0; i < dirtyNodes.length; i++) {
        if (_shouldMergeDirtyNodes) {
          _shouldMergeDirtyNodes = false;
          if (_nodesNeedingLayout.isNotEmpty) {
            _nodesNeedingLayout.addAll(dirtyNodes.getRange(i, dirtyNodes.length));
            break;
          }
        }
        final RenderObject node = dirtyNodes[i];
        if (node._needsLayout && node.owner == this) {
          node._layoutWithoutResize(); // 布局方法
        }
      }
      // No need to merge dirty nodes generated from processing the last
      // relayout boundary back.
      _shouldMergeDirtyNodes = false;
    }

    for (final PipelineOwner child in _children) {
      child.flushLayout();
    }

  } finally {
    _shouldMergeDirtyNodes = false;
  }
}
```

此函数主要是遍历需要重新布局的`RenderObject`列表（`_nodesNeedingLayout`）进行布局（一般是通过`markNeedsLayout`方法加入到此列表），布局后进行子级递归调用此方法。

RenderObject#\_layoutWithoutResize

```dart
@pragma('vm:notify-debugger-on-exception')
void _layoutWithoutResize() {
  RenderObject? debugPreviousActiveLayout;
  try {
    performLayout();
    markNeedsSemanticsUpdate();
  } catch (e, stack) {...}
  _needsLayout = false;
  markNeedsPaint();
}
```

此函数中不进行大小的布局，因为只有在`paint`的时候才能确定大小，现在只是布局。

`perfromLayout`： 进行布局的计算，因为每个`RenderObject`的布局信息都不一样这里就不做特意讲解了

`markNeedsSemanticsUpdate`： 标记语义化更新并加入语义化更新列表中

`markNeedsPaint`： 标记此`RenderObject` 需要重绘

RenderObject#markNeedsPaint

```dart
void markNeedsPaint() {
  if (_needsPaint) return;
  _needsPaint = true;
  // If this was not previously a repaint boundary it will not have
  // a layer we can paint from.
  if (isRepaintBoundary && _wasRepaintBoundary) {
    // If we always have our own layer, then we can just repaint
    // ourselves without involving any other nodes.
    assert(_layerHandle.layer is OffsetLayer);
    if (owner != null) {
      owner!._nodesNeedingPaint.add(this);
      owner!.requestVisualUpdate();
    }
  } else if (parent is RenderObject) {
    final RenderObject parent = this.parent! as RenderObject;
    parent.markNeedsPaint();
    assert(parent == this.parent);
  } else {
    // If we are the root of the render tree and not a repaint boundary
    // then we have to paint ourselves, since nobody else can paint us.
    // We don't add ourselves to _nodesNeedingPaint in this case,
    // because the root is always told to paint regardless.
    //
    // Trees rooted at a RenderView do not go through this
    // code path because RenderViews are repaint boundaries.
    if (owner != null) {
      owner!.requestVisualUpdate();
    }
  }
}
```

在函数中标记此`RenderObject`是需要更新的。

如果**重绘边界**发生变化，那么会把当前`renderObject`添加到需要重绘的列表中并重新**请求视觉（UI）**更新，否则如果父级是`RenderObject`的话，那么父级也需要进行标记，因为某些父级的布局是依赖与子级的，所以这里是一个向上的递归，否则直接更新**视觉**。

至此`flushLayout` 结束，总的来说就是一个冲刷布局的方法。

##### 13.2.2.PipelineOwner#flushCompositingBits

```dart
void flushCompositingBits() {
  _nodesNeedingCompositingBitsUpdate.sort((RenderObject a, RenderObject b) => a.depth - b.depth);

  for (final RenderObject node in _nodesNeedingCompositingBitsUpdate) {
    if (node._needsCompositingBitsUpdate && node.owner == this) {
      node._updateCompositingBits();
    }
  }

  _nodesNeedingCompositingBitsUpdate.clear();
  for (final PipelineOwner child in _children) {
    child.flushCompositingBits();
  }
}
```

此函数主要是更新需要合成位的列表。

RenderObject#\_updateCompositingBits

```dart
void _updateCompositingBits() {
  if (!_needsCompositingBitsUpdate) return;
  final bool oldNeedsCompositing = _needsCompositing;
  _needsCompositing = false;
  visitChildren((RenderObject child) {
    child._updateCompositingBits();
    if (child.needsCompositing) {
      _needsCompositing = true;
    }
  });
  if (isRepaintBoundary || alwaysNeedsCompositing) {
    _needsCompositing = true;
  }
  // If a node was previously a repaint boundary, but no longer is one, then
  // regardless of its compositing state we need to find a new parent to
  // paint from. To do this, we mark it clean again so that the traversal
  // in markNeedsPaint is not short-circuited. It is removed from _nodesNeedingPaint
  // so that we do not attempt to paint from it after locating a parent.
  if (!isRepaintBoundary && _wasRepaintBoundary) {
    _needsPaint = false;
    _needsCompositedLayerUpdate = false;
    owner?._nodesNeedingPaint.remove(this);
    _needsCompositingBitsUpdate = false;
    markNeedsPaint();
  } else if (oldNeedsCompositing != _needsCompositing) {
    _needsCompositingBitsUpdate = false;
    markNeedsPaint();
  } else {
    _needsCompositingBitsUpdate = false;
  }
}
```

此函数主要是递归标记是否需要合成`_needsCompositing`，并且判断该**边界（图层）**是否有变化，有变化则加入到绘制列表中。

完成列表更新后清除该列表，然后再**递归处理子级的合成位**。

至此`flushCompositingBits`就结束了，总的来说就是标记是否需要合成，然后加入到需要重绘的列表中。

##### 13.2.3.PipelineOwner#flushPaint

```dart
void flushPaint() {
  try {
    final List<RenderObject> dirtyNodes = _nodesNeedingPaint;
    _nodesNeedingPaint = <RenderObject>[];

    // Sort the dirty nodes in reverse order (deepest first).
    for (final RenderObject node in dirtyNodes..sort((RenderObject a, RenderObject b) => b.depth - a.depth)) {
      assert(node._layerHandle.layer != null);
      if ((node._needsPaint || node._needsCompositedLayerUpdate) && node.owner == this) {
        if (node._layerHandle.layer!.attached) {
          assert(node.isRepaintBoundary);
          if (node._needsPaint) {
            PaintingContext.repaintCompositedChild(node);
          } else {
            PaintingContext.updateLayerProperties(node);
          }
        } else {
          node._skippedPaintingOnLayer();
        }
      }
    }

    for (final PipelineOwner child in _children) {
      child.flushPaint();
    }

  } finally {...}
}
```

在函数中遍历了`_nodesNeedingPaint`列表并且在循环中判断了如果`RenderObject`的`layer`没有被附着（**不存在 owner**）那么就使用`_skippedPaintingOnLayer`跳过绘制，否则如果需要重绘就进行重绘，不需要重绘就进行`layer`属性的更新。

需要绘制的列表`_nodesNeedingPaint`一般通过`markNeedingPaint`或`markNeedsCompositedLayerUpdate`进行加入的。

需要重绘则用`repaintCompositedChild`。

PaintingContext#repaintCompositedChild

```dart
static void repaintCompositedChild(RenderObject child, { bool debugAlsoPaintedParent = false }) {
  assert(child._needsPaint);
  _repaintCompositedChild(
    child,
    debugAlsoPaintedParent: debugAlsoPaintedParent,
  );
}
```

PaintingContext#\_repaintCompositedChild

```dart
static void _repaintCompositedChild(RenderObject child, {bool debugAlsoPaintedParent = false, PaintingContext? childContext })
{
  OffsetLayer? childLayer = child._layerHandle.layer as OffsetLayer?;
  if (childLayer == null) {
    // Not using the `layer` setter because the setter asserts that we not
    // replace the layer for repaint boundaries. That assertion does not
    // apply here because this is exactly the place designed to create a
    // layer for repaint boundaries.
    final OffsetLayer layer = child.updateCompositedLayer(oldLayer: null);
    child._layerHandle.layer = childLayer = layer;
  } else {
    Offset? debugOldOffset;
    childLayer.removeAllChildren();
    final OffsetLayer updatedLayer = child.updateCompositedLayer(oldLayer: childLayer);
  }
  child._needsCompositedLayerUpdate = false;
  childContext ??= PaintingContext(childLayer, child.paintBounds);
  child._paintWithContext(childContext, Offset.zero);
  // Double-check that the paint method did not replace the layer (the first
  // check is done in the [layer] setter itself).
  assert(identical(childLayer, child._layerHandle.layer));
  childContext.stopRecordingIfNeeded();
}
```

在函数中首先获取了`RenderObject`的`layer`，如果`layer`不存在就通过然后`updateCompositedLayer`方法进行更新一个，存在就把`layer`的`children`全部给移除掉，因为需要重新绘制了。

RenderObject#updateCompositedLayer

```dart
OffsetLayer updateCompositedLayer({required covariant OffsetLayer? oldLayer}) {
  assert(isRepaintBoundary);
  return oldLayer ?? OffsetLayer();
}
```

如果不存在笔画的上下文`childContext`，那么就通过`layer`与`bounds`生成一个。

然后通过`_paintWithContext`在指定的上下文中绘制。

RenderObject#\_paintWithContext

```dart
void _paintWithContext(PaintingContext context, Offset offset) {
    // If we still need layout, then that means that we were skipped in the
    // layout phase and therefore don't need painting. We might not know that
    // yet (that is, our layer might not have been detached yet), because the
    // same node that skipped us in layout is above us in the tree (obviously)
    // and therefore may not have had a chance to paint yet (since the tree
    // paints in reverse order). In particular this will happen if they have
    // a different layer, because there's a repaint boundary between us.
    if (_needsLayout) return;
    RenderObject? debugLastActivePaint;
    _needsPaint = false;
    _needsCompositedLayerUpdate = false;
    _wasRepaintBoundary = isRepaintBoundary;
    try {
      paint(context, offset); // 调用绘制
      assert(!_needsLayout); // check that the paint() method didn't mark us dirty again
      assert(!_needsPaint); // check that the paint() method didn't mark us dirty again
    } catch (e, stack) {
      _reportException('paint', e, stack);
    }
  }
```

最终调用`paint`进行绘制。

绘制完后调用`stopRecordingIfNeeded`， 结束绘制并生成信息。

PaintingContext#stopRecordingIfNeeded

```dart
@protected
@mustCallSuper
void stopRecordingIfNeeded() {
  if (!_isRecording) return;
  _currentLayer!.picture = _recorder!.endRecording();
  _currentLayer = null;
  _recorder = null;
  _canvas = null;
}
```

此函数停止记录并生成`Picture`赋值给`_currentLayer`的`picture`，然后置空`_currentLayer`。

虽然把`_currentLayer`赋值为`null`了，但是这只是把`PaintingContext`的`layer`置为空，`node`的`layer`并没有受到影响，因为`currentLayer`已经加入到`_containerLayer`中了。

```dart
class PaintingContext extends ClipContext {
  PaintingContext(this._containerLayer, this.estimatedBounds);

  final ContainerLayer _containerLayer;

  final Rect estimatedBounds;

  @override
  Canvas get canvas {
    if (_canvas == null) {
      _startRecording();
    }
    assert(_currentLayer != null);
    return _canvas!;
  }

  ...
}
```

至此`repaintCompositedChild`方法就执行完了，总的来说就是绘制到`layer`上。

如果不需要重绘但是需要更新图层的属性，则用 `updateLayerProperties`。

PaintingContext#updateLayerProperties

```dart
static void updateLayerProperties(RenderObject child) {
  assert(child.isRepaintBoundary && child._wasRepaintBoundary);
  assert(!child._needsPaint);
  assert(child._layerHandle.layer != null);

  final OffsetLayer childLayer = child._layerHandle.layer! as OffsetLayer;
  Offset? debugOldOffset;
  final OffsetLayer updatedLayer = child.updateCompositedLayer(oldLayer: childLayer);
  assert(identical(updatedLayer, childLayer),
         '$child created a new layer instance $updatedLayer instead of reusing the '
         'existing layer $childLayer. See the documentation of RenderObject.updateCompositedLayer '
         'for more information on how to correctly implement this method.'
        );
  assert(debugOldOffset == updatedLayer.offset);

  child._needsCompositedLayerUpdate = false; // 修改标志
}
```

在函数中做了一系列的断言保证这个`layer`是原来的`layer`。

如果没有附着 layer 就使用`_skippedPaintingOnLayer`跳过。

RenderObject#\_skippedPaintingOnLayer

```dart
void _skippedPaintingOnLayer() {
  assert(attached);
  assert(isRepaintBoundary);
  assert(_needsPaint || _needsCompositedLayerUpdate);
  assert(_layerHandle.layer != null);
  assert(!_layerHandle.layer!.attached);
  AbstractNode? node = parent;
  while (node is RenderObject) {
    if (node.isRepaintBoundary) {
      if (node._layerHandle.layer == null) {
        // Looks like the subtree here has never been painted. Let it handle itself.
        break;
      }
      if (node._layerHandle.layer!.attached) {
        // It's the one that detached us, so it's the one that will decide to repaint us.
        break;
      }
      node._needsPaint = true;
    }
    node = node.parent;
  }
}
```

最后处理完需要重绘的列表后，递归处理子级。

至此绘制阶段就结束，但是**还没有放到 view 上**。总的来说`flushPaint`就是绘制并保存`picture`到`layer`上。

##### 13.2.4.RenderView#compositeFrame

```dart
void compositeFrame() {
  try {
    final ui.SceneBuilder builder = ui.SceneBuilder();
    final ui.Scene scene = layer!.buildScene(builder);
    if (automaticSystemUiAdjustment) {
      _updateSystemChrome();
    }
    _view.render(scene);
    scene.dispose();

  } finally {...}
}
```

在函数中主要是通过`RenderObject`的`layer`生成场景。

每个`RenderObject`都有一个`layer`，然后通过`buildScene`方法把`layer`上的绘制数据构建成`Scene`数据。

如果需要调整系统 UI 就调整一下（状态栏等），一般不会去动它了解就好。

然后通过`render`方法把`layer`生成的场景渲染上图，一般场景只用一次就丢弃掉，下一帧又会有新的场景绘制。

FlutterView

```dart
void render(Scene scene) => _render(scene);

@Native<Void Function(Pointer<Void>)>(symbol: 'PlatformConfigurationNativeApi::Render')
external static void _render(Scene scene);
```

`_view`：`FlutteView`类型，在安全的视图上进行渲染。

##### 13.2.5.PipelineOwner#flushSemantics

```dart
void flushSemantics() {
  if (_semanticsOwner == null) return;
  try {
    final List<RenderObject> nodesToProcess = _nodesNeedingSemantics.toList()
      ..sort((RenderObject a, RenderObject b) => a.depth - b.depth);
    _nodesNeedingSemantics.clear();
    for (final RenderObject node in nodesToProcess) {
      if (node._needsSemanticsUpdate && node.owner == this) {
        node._updateSemantics();
      }
    }
    _semanticsOwner!.sendSemanticsUpdate();
    for (final PipelineOwner child in _children) {
      child.flushSemantics();
    }
  } finally {...}
}
```

此函数主要是进行一些语义化的渲染，这里就不多讲了。

到此`super.drawFrame`就结束了，总的来说就是渲染上图的功能

#### 13.3.buildOwner#finalizeTree

```dart
@pragma('vm:notify-debugger-on-exception')
void finalizeTree() {
  try {
    lockState(_inactiveElements._unmountAll); // this unregisters the GlobalKeys
  } catch (e, stack) {...} finally {...}
}
```

此函数作为最后的绘制结尾阶段， 完成一些不使用的`element`的卸载，以及解绑`key`等操作。

`_inactiveElements`： 持有一些未激活的`element`的类

`_inactiveElements._unmountAll`：卸载全部的未激活的`element`

BuildOwner#lockState

```dart
void lockState(VoidCallback callback) {
  assert(_debugStateLockLevel >= 0);
  assert(() {
    _debugStateLockLevel += 1;
    return true;
  }());
  try {
    callback(); // 调用回调
  } finally {
    assert(() {
      _debugStateLockLevel -= 1;
      return true;
    }());
  }
  assert(_debugStateLockLevel >= 0);
}
```

该函数虽然只调用了回调，但是通过`assert`来确保在`State.dispose`中不能调用`setState`等`element`操作。

\_InactiveElements#\_unmountAll

```dart
void _unmountAll() {
  _locked = true;
  final List<Element> elements = _elements.toList()..sort(Element._sort);
  _elements.clear();
  try {
    elements.reversed.forEach(_unmount);
  } finally {
    assert(_elements.isEmpty);
    _locked = false;
  }
}
```

```dart
void _unmount(Element element) {
  assert(element._lifecycleState == _ElementLifecycle.inactive);
  assert(() {
    if (debugPrintGlobalKeyedWidgetLifecycle) {
      if (element.widget.key is GlobalKey) {
        debugPrint('Discarding $element from inactive elements list.');
      }
    }
    return true;
  }());
  element.visitChildren((Element child) {
    assert(child._parent == element);
    _unmount(child);
  });
  element.unmount();
  assert(element._lifecycleState == _ElementLifecycle.defunct);
}
```

StatefulElement#unmount

```dart
@override
void unmount() {
  super.unmount();
  state.dispose();
  state._element = null;
  // Release resources to reduce the severity of memory leaks caused by
  // defunct, but accidentally retained Elements.
  _state = null;
}
```

在函数中首先调用`super.unmount`（`Element.unmount`），来进行卸载。

Element#unmount

```dart
@mustCallSuper
void unmount() {
  assert(_lifecycleState == _ElementLifecycle.inactive);
  assert(_widget != null); // Use the private property to avoid a CastError during hot reload.
  assert(owner != null);
  if (kFlutterMemoryAllocationsEnabled) {
    MemoryAllocations.instance.dispatchObjectDisposed(object: this);
  }
  // Use the private property to avoid a CastError during hot reload.
  final Key? key = _widget?.key;
  if (key is GlobalKey) {
    owner!._unregisterGlobalKey(key, this);
  }
  // Release resources to reduce the severity of memory leaks caused by
  // defunct, but accidentally retained Elements.
  _widget = null;
  _dependencies = null;
  _lifecycleState = _ElementLifecycle.defunct;
}
```

在函数中如果有`key`是`GlobalKey`类型，那么就从所有者当中撤销掉，然后把一些必要的状态给清空。

回到上一层，主要是把`state`状态给销毁掉。

`state.dispose`：调用回调销毁

剩下的就置空。

至此`buildOwner.finalizaTree`就结束了，主要就是一些组件的卸载。

整个`drawFrame`阶段就完成了，然后我们回到 `12._handlePersistentFrameCallback` 方法中。

### 14.RendererBinding#\_scheduleMouseTrackerUpdate

```dart
void _scheduleMouseTrackerUpdate() {
  SchedulerBinding.instance.addPostFrameCallback((Duration duration) {
    _mouseTracker!.updateAllDevices(renderView.hitTestMouseTrackers);
  });
}
```

此函数中往帧尾注册了一个 处理设备的回调，这个等我们处理到`postFrameCallbacks`阶段再来看。

目前为止在`RendererBinding`中注册的`_handlePersistentFrameCallback` 就执行完了。

其余的`persistentCallbacks`回调就自己了解吧。

总结：这个`persistentCallbacks`阶段主要就是构建以及渲染上图的过程。

紧接着回到第 11.`handleDrawFrame`步继续执行。

从`persistentCallbacks`进阶成`postFrameCallbacks`阶段。

调用`postFrameCallbacks`阶段所有注册的回调，回调完成后清空列表。

`postFrameCallbacks`阶段的回调列表基本都是对于一些已经刷新完后`widget`的操作，比如说**获取更新后 widget 大小**或**设置一些 setState 刷新操作**等，这个有很多`widget`都用到了，这里就不一一做讲解了，目前就讲述 刚刚所说的 **处理设备的回调**。

`_mouseTracker`：鼠标跟踪器，随着`RendererBinding`初始化进行初始

RendererBinding#initMouseTracker

```dart
@visibleForTesting
void initMouseTracker([MouseTracker? tracker]) {
  _mouseTracker?.dispose();
  _mouseTracker = tracker ?? MouseTracker();
}
```

`_mouseTracker!.updateAllDevices(renderView.hitTestMouseTrackers)`：更新鼠标设备

`renderView.hitTestMouseTrackers`： 通过`position`来确定命中的`HitTestEntry`并返回`HitTestResult`

RenderView

```dart
HitTestResult hitTestMouseTrackers(Offset position) {
  final BoxHitTestResult result = BoxHitTestResult();
  hitTest(result, position: position);
  return result;
}

bool hitTest(HitTestResult result, { required Offset position }) {
  if (child != null) {
    child!.hitTest(BoxHitTestResult.wrap(result), position: position);
  }
  result.add(HitTestEntry(this));
  return true;
}
```

#### 14.1.MouseTracker#updateAllDevices

```dart
void updateAllDevices(MouseDetectorAnnotationFinder hitTest) {
  _deviceUpdatePhase(() {
    for (final _MouseState dirtyState in _mouseStates.values) {
      final PointerEvent lastEvent = dirtyState.latestEvent;
      final LinkedHashMap<MouseTrackerAnnotation, Matrix4> nextAnnotations = _findAnnotations(dirtyState, hitTest);
      final LinkedHashMap<MouseTrackerAnnotation, Matrix4> lastAnnotations = dirtyState.replaceAnnotations(nextAnnotations);

      _handleDeviceUpdate(_MouseTrackerUpdateDetails.byNewFrame(
        lastAnnotations: lastAnnotations,
        nextAnnotations: nextAnnotations,
        previousEvent: lastEvent,
      ));
    }
  });
}
```

此函数中首先使用了`_deviceUpdatePhase`方法保证在执行设备更新时必须是在设备更新阶段。

##### 14.1.1.MouseTracker#\_deviceUpdatePhase

```dart
void _deviceUpdatePhase(VoidCallback task) {
  assert(!_debugDuringDeviceUpdate);
  assert(() {
    _debugDuringDeviceUpdate = true;
    return true;
  }());
  task();
  assert(() {
    _debugDuringDeviceUpdate = false;
    return true;
  }());
}
```

断言当前的阶段是**设备更新阶段**才可以触发。

回到上一层。

遍历`_mouseStates`中的状态并处理。

`_mouseStates`： 跟踪鼠标的状态的键值对，键是设备 id，值是状态，比如`hover`、`add`等。

然后通过`_findAnnotations`来获取在此位置上所有命中的`MouseTrackerAnnotation`类。

##### 14.1.2.MouseTracker#\_findAnnotations

```dart
LinkedHashMap<MouseTrackerAnnotation, Matrix4> _findAnnotations(_MouseState state, MouseDetectorAnnotationFinder hitTest) {
  final Offset globalPosition = state.latestEvent.position;
  final int device = state.device;
  if (!_mouseStates.containsKey(device)) {
    return LinkedHashMap<MouseTrackerAnnotation, Matrix4>();
  }

  return _hitTestResultToAnnotations(hitTest(globalPosition));
}
```

如果这个设备号并没有加入到鼠标状态中，那就直接返回。

否则就通过`hitTest`方法获取到`hitTestResult`后将其转换成 `annotations`。

`_hitTestResultToAnnotation`：把`HitTestResult`转换成注释列表

MouseTracker#\_hitTestResultToAnnotationÏ

```dart
LinkedHashMap<MouseTrackerAnnotation, Matrix4> _hitTestResultToAnnotations(HitTestResult result) {
  final LinkedHashMap<MouseTrackerAnnotation, Matrix4> annotations = LinkedHashMap<MouseTrackerAnnotation, Matrix4>();
  for (final HitTestEntry entry in result.path) {
    final Object target = entry.target;
    if (target is MouseTrackerAnnotation) {
      annotations[target] = entry.transform!;
    }
  }
  return annotations;
}
```

此函数中给每个目标的进行了判断，如果命中目标的类型是`MouseTrackerAnnotation`，那么就以`key`为命中目标，`value`为目标位置，加入到注解 map 中。

等所有命中的目标处理完后就返回`annotations`。

然后通过 `dirtyState.replaceAnnotations` 方法把旧的`annotations`给替换掉。

##### 14.1.3.\_MouseState#replaceAnnotations

```dart
LinkedHashMap<MouseTrackerAnnotation, Matrix4> replaceAnnotations(LinkedHashMap<MouseTrackerAnnotation, Matrix4> value) {
  final LinkedHashMap<MouseTrackerAnnotation, Matrix4> previous = _annotations;
  _annotations = value;
  return previous;
}
```

在函数中用新`annotations`替换旧`annotations`，返回旧`annotations`。

然后调用`_MouseTrackerUpdateDetails.byNewFrame`生成一个新的`_MouseTrackerUpdateDetails`。

```dart
@immutable
class _MouseTrackerUpdateDetails with Diagnosticable {
  /// When device update is triggered by a new frame.
  ///
  /// All parameters are required.
  const _MouseTrackerUpdateDetails.byNewFrame({
    required this.lastAnnotations,
    required this.nextAnnotations,
    required PointerEvent this.previousEvent,
  }) : triggeringEvent = null;
  ...
}
```

然后传递给传递给`_handleDeviceUpdate`。

##### 14.1.4.MouseTracker#\_handleDeviceUpdate

```dart
void _handleDeviceUpdate(_MouseTrackerUpdateDetails details) {
  assert(_debugDuringDeviceUpdate);
  _handleDeviceUpdateMouseEvents(details);
  _mouseCursorMixin.handleDeviceCursorUpdate(
    details.device,
    details.triggeringEvent,
    details.nextAnnotations.keys.map((MouseTrackerAnnotation annotation) => annotation.cursor),
  );
}
```

###### 14.1.4.1.\_handleDeviceUpdateMouseEvents

```dart
static void _handleDeviceUpdateMouseEvents(_MouseTrackerUpdateDetails details) {
  final PointerEvent latestEvent = details.latestEvent;

  final LinkedHashMap<MouseTrackerAnnotation, Matrix4> lastAnnotations = details.lastAnnotations;
  final LinkedHashMap<MouseTrackerAnnotation, Matrix4> nextAnnotations = details.nextAnnotations;

  // Order is important for mouse event callbacks. The
  // `_hitTestResultToAnnotations` returns annotations in the visual order
  // from front to back, called the "hit-test order". The algorithm here is
  // explained in https://github.com/flutter/flutter/issues/41420

  // Send exit events to annotations that are in last but not in next, in
  // hit-test order.
  final PointerExitEvent baseExitEvent = PointerExitEvent.fromMouseEvent(latestEvent);
  lastAnnotations.forEach((MouseTrackerAnnotation annotation, Matrix4 transform) {
    if (!nextAnnotations.containsKey(annotation)) {
      if (annotation.validForMouseTracker && annotation.onExit != null) {
        // 触发onExit事件
        annotation.onExit!(baseExitEvent.transformed(lastAnnotations[annotation]));
      }
    }
  });

  // Send enter events to annotations that are not in last but in next, in
  // reverse hit-test order.
  final List<MouseTrackerAnnotation> enteringAnnotations = nextAnnotations.keys.where(
    (MouseTrackerAnnotation annotation) => !lastAnnotations.containsKey(annotation),
  ).toList();
  final PointerEnterEvent baseEnterEvent = PointerEnterEvent.fromMouseEvent(latestEvent);
  for (final MouseTrackerAnnotation annotation in enteringAnnotations.reversed) {
    if (annotation.validForMouseTracker && annotation.onEnter != null) {
      // 触发onEnter事件
      annotation.onEnter!(baseEnterEvent.transformed(nextAnnotations[annotation]));
    }
  }
}
```

在函数中做一些 命中目标`MouseTrackerAnnotation`上的事件，一般就是`onExit`/`onEnter`事件，然后回调给用户。

一般命中的目标是`RenderMouseRegion`，它实现`MouseTrackerAnnotation`，间接继承`RenderBox`， 使用这个`RenderObject`的`widget`是`MouseRegion`

回到上一层。

###### 14.1.4.2.MouseCursorManager#handleDeviceCursorUpdate

```dart
void handleDeviceCursorUpdate(
  int device,
  PointerEvent? triggeringEvent,
  Iterable<MouseCursor> cursorCandidates,
) {
  if (triggeringEvent is PointerRemovedEvent) {
    _lastSession.remove(device);
    return;
  }

  final MouseCursorSession? lastSession = _lastSession[device];
  final MouseCursor nextCursor = _DeferringMouseCursor.firstNonDeferred(cursorCandidates)
    ?? fallbackMouseCursor;

  assert(nextCursor is! _DeferringMouseCursor);

  if (lastSession?.cursor == nextCursor) return;

  final MouseCursorSession nextSession = nextCursor.createSession(device);
  _lastSession[device] = nextSession;

  lastSession?.dispose();
  nextSession.activate();
}
```

此函数就做一些鼠标光标的操作。

鼠标光标移出程序时移除此鼠标设备。

当鼠标光标发生变化，比如说鼠标移动到按钮上的时候改变，就把之前的鼠标样式`dispose`，然后激活新的鼠标样式。

至此鼠标设备等操作就结束了。

紧接着回到第`11.handleDrawFrame`继续执行。

`_postFrameCallbacks`回调执行完成后就清除回调，最后从`postFrameCallbacks`变为`idle`阶段，至此一帧的流程就此结束。

这就是`Flutter`在一帧当中处理的全部内容。

## 总结

在生成帧期间发生的各个阶段。总的来说，这些阶段包括：

1. 动画阶段：该阶段调用所有已注册的短暂帧回调函数（通过 `scheduleFrameCallback` 注册），并按照注册顺序执行。这包括所有正在驱动 `AnimationController` 的 `Ticker` 实例，这意味着此时所有活动的 `Animation` 对象都在运行。
2. 微任务阶段：在 `handleBeginFrame` 返回后，任何由短暂帧回调函数调度的微任务都会运行。这通常包括来自 `Ticker` 和 `AnimationController` 的 Future 的回调函数，这些 Future 已在此帧内完成。
3. 构建阶段：重建所有在小部件树中标记为脏的 `Element`（参见 `State#build`）。有关将小部件标记为需要重建的更多信息，请参见 `State#setState`。有关此步骤的更多信息，请参见 `BuildOwner`。
4. 布局阶段：对系统中所有标记为脏的 `RenderObject` 进行布局（参见 `RenderObject#performLayout`）。有关将对象标记为需要布局的更多信息，请参见 `RenderObject#markNeedsLayout`。
5. 合成位阶段：更新任何脏的 `RenderObject` 对象上的合成位。参见 `RenderObject#markNeedsCompositingBitsUpdate`。
6. 绘制阶段：重绘系统中所有标记为脏的 `RenderObject`（参见 `RenderObject.paint`）。这将生成 `Layer` 树。有关将对象标记为需要绘制的更多信息，请参见 `RenderObject#markNeedsPaint`。
7. 合成阶段：将图层树转换为 `Scene` 并发送到 GPU。
8. 语义阶段：更新系统中所有标记为脏的 `RenderObject` 的语义（参见 `RenderObject#assembleSemanticsNode`）。这将生成 `SemanticsNode` 树。有关将对象标记为需要语义更新的更多信息，请参见 `RenderObject#markNeedsSemanticsUpdate`。
9. 小部件层的最终化阶段：小部件树最终化。这会导致在此帧中从小部件树中删除的任何对象上调用 `State#dispose`。有关更多详细信息，请参见 `BuildOwner#finalizeTree`。
10. 调度层中的最终化阶段：在 `drawFrame()` 返回后，`handleDrawFrame()` 调用后帧回调函数（通过 `addPostFrameCallback` 注册）。

加油吧，骚年!
