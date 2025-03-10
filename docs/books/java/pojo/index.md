# 介绍

Java POJO 对象介绍

1. AO（Application Object）应用对象
2. BO（ Business Object）业务对象
3. DAO （Data Access Object）数据访问对象
4. DO （Domain Object）领域对象
5. DTO（Data Transfer Object）数据传输对象
6. Entity（应用程序域中的一个概念）实体
7. Model （概念实体模型）实体类和模型
8. PO（Persistent Object）持久化对象
9. POJO（Plain Ordinary Java Object）纯普通 Java 对象
10. VO（View Object）视图模型
11. View （概念视图模型）视图模型

## AO

AO（Application Object）应用对象

AO 是一个较为笼统的概念，因为太过于常见而并没有刻意的去描绘它的细节。

举一个很简单的栗子：控制层（Controller） 在 业务逻辑层（Service） 查询一条或多条数据，这个数据的传输过程的运载就是 AO 完成。在正常的业务逻辑中一般都有很多种类型的数据，例如 整形、字符型、集合、类 等，我们把它统称为 AO。

在 控制层（Controller）与 业务逻辑层（Service）层之间抽象的复用对象模型，有时候极为贴近展示层，复用度不高。

简单解释： 控制层 与 业务逻辑层 两层之间的参数传递，可视为 AO

```java
  // 控制层
  public class OrderController {
    public void createOrder(){
      orderService.createOrder(OrderAO orderAO)
    }
  }

  // 业务逻辑层
  public class OrderService {
    public Object createOrder(OrderAO orderAO){}
  }

  // AO层
  public class OrderAO {
    private String id;
    private String orderId;
    // ...
  }
```

## BO

BO（ Business Object）业务对象

业务对象(Business Object，BO)是对数据进行检索和处理的组件。

主要作用是把业务逻辑封装为一个对象,这个对象可以包括一个或多个其它的对象。形象描述为一个对象的形为和动作，当然也有涉及到基它对象的一些形为和动作。

一般用在包含业务功能模块 的具体实例上，比如我们写了一个 Controller、一个 Service、一个 DAO、一个工具类等等这一系列实例组合后能实现一些功能，这些一系列实例组合为一个组件，这个组件就是 BO。

简单解释： 一个处理业务逻辑的工具对象，可视为 BO

```java
  //  BO层
  public class OrderBO {
    // 创建订单
    public Object createOrder(){};
    // 移除订单
    public Object removeOrder(){};
    // 查找订单
    public Object findOrder(){};
    // 移除订单
    public Object updateOrder(){};
  }
```

## DAO

DAO(Data Access Object) 数据访问对象

是一个数据访问接口，主要是与数据库交互。

简单理解: mapper 接口

```java
  // DAO层/mapper层
  public interface OrderMapper {
    createOrder(OrderAO orderAO)
  }
```

## DO

DO （Domain Object）领域对象

领域对象 DO 是从现实世界中抽象出来的有形或无形的业务实体。

在与数据有关的操作中数据存在数据库使用 DAO 访问被取出来时，一般会将这些数据规范化的定义成类，而这个类就是 DO，用来接收数据库对应的实体，它是一种抽象化的数据状态，介于数据库与业务逻辑之间。

一般在 业务逻辑层（Service） 对 数据库（SQL） 的 访问时 接收数据 使用。

另外：DO 与 Entity 概念上浅显的相同，他们在实际应用中是一个东西。稍微的不同点就是 DO 是与数据库存在着某种映射关系的 Entity，总的来说 DO 是 Entity 的一种。

xxxDO，xxx 即为数据表名

简单理解: 数据库中的所有字段，所组成的实体类。可视为 DO

```java
  // DO层
  public class OrderDO {
    private String id;
    private String orderId;
    // ...
  }
```

## DTO

DTO（Data Transfer Object）数据传输对象

数据传输对象 DTO (Data Transfer Object)，是一种设计模式之间传输数据的软件应用系统。

数据传输目标往往是数据访问对象从数据库中检索数据。

数据传输对象与数据交互对象或数据访问对象之间的差异是一个以不具有任何行为除了存储和检索的数据（访问和存取器）。

简单理解: 前端往后端传输数据的对象。可视为 DTO

```java
  // 控制层
  public class OrderController {
    public void createOrder(OrderDTO orderDTO){}
  }

  // DTO层
  public class OrderDTO {
    private String id;
    private String orderId;
    // ...
  }
```

## Entity

Entity（应用程序域中的一个概念）实体

ADO .NET Entity Framework 应用程序域中的一个概念，数据类型在该域中定义。

在计算机网络中，实体这一较为抽象的名词表示任何可能发送或接受信息的硬件或软件进程。在许多情况下，实体就是一个特定的软件模块。

说白了 Entity 是一个未被持久化的对象，它是一个类，从现实抽象到代码的一个类。

简单理解: 排除 DO 层中不需要的字段后，所组成的实体类。可视为 Entity

```java
  // Entity层
  public class OrderEntity {
    private String id;
    // ...
  }
```

## Model

Model （概念实体模型）实体类和模型

Model 是计算机程序设计中有两个概念：一个是三层架构中的实体类，另一个是 MVC 架构中的模型。

在“三层架构”中，为了面向对象编程，将各层传递的数据封装成实体类，便于数据传递和提高可读性。

在 MVC（模型 Model-视图 View-控制器 Controller）模式中，Model 代表模型，是业务流程/状态的处理以及业务规则的制定，接受视图请求的数据，并返回最终的处理结果。

业务模型的设计可以说是 MVC 最主要的核心。

## PO

PO（Persistent Object）持久化对象

数据库表中的记录在 java 对象中的显示状态，最形象的理解就是一个 PO 就是数据库中的一条记录。

好处是可以把一条记录作为一个对象处理，可以方便的转为其它对象。

例如我们有一条数据，现在有一个简单类而且已经是被赋予了这条数据的实例，那么目前这条数据在这个简单类的存在状态就是 PO，不管这个简单类是 DO 还是 BO 还是其他。

PO 只是数据持久化的一个状态。

简单理解：是 DO 或 Entity 等层的集合，相当于 AO,BO 等是属于 POJO 的。可视为 PO

## POJO

POJO（ Plain Ordinary Java Object）纯普通 Java 对象

总的来说 POJO 包含 DO、DTO、BO、VO，这些本质上都是一个简单的 java 对象，实际就是普通 JavaBeans，是为了避免和 EJB 混淆所创造的简称

使用 POJO 名称是为了避免和 EJB 混淆起来, 而且简称比较直接。

其中有一些属性及其 getter setter 方法的类,没有业务逻辑，有时可以作为 VO(value -object)或 dto(Data Transform Object)来使用。

当然，这里特意说明纯普通 Java 对象，如果你有一个简单的运算属性也是可以的,但不允许有业务方法,也不能携带有 connection 之类的方法。

## View

View （概念视图模型）视图模型

在 MVC（模型 Model-视图 View-控制器 Controller）模式中，View 代表视图，用来解析 Model 带来的数据模型，以展示视图数据，View 的模型觉决定了需要什么样的 Model 来对接，相互联系。

## VO

VO（View Object）视图模型

VO 是显示视图模型，视图对象，用于展示层，它的作用是把某个指定页面（或组件）的所有数据封装起来。

如果是一个 DTO 对应一个 VO，则 DTO=VO;但是如果一个 DTO 对应多个 VO，则展示层需要把 VO 转换为服务层对应方法所要求的 DTO，传送给服务层。从而达到服务层与展示层解耦的效果。

一般用在业务逻辑层（Service） 对 前端（Web） 的 视图模型效果控制的展示上，说白了就是后台向前端传输数据。

xxxVO，xxx 一般为网页名称。

简单理解: 后端返回给前端数据对象，可视为 VO 层

```java
  // 控制层
  public class OrderController {
    public OrderVO createOrder(){
      return new OrderVO();
    }
  }

  // VO层
  public class OrderVO {
    private String id;
    private String orderId;
    // ...
  }
```
