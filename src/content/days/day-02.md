---
day: 2
title: Java 面向对象设计与工程分层——从能运行到可替换、可维护
date: '2026-08-25'
summary: 通过重构内存版用户管理系统，深入理解封装、接口、多态、组合、依赖注入、Repository 与工程分层。
tags:
  - Java
  - 面向对象
  - 接口
  - 工程分层
  - 依赖倒置
status: planned
duration: 90 分钟
---
# Day 2：Java 面向对象设计与工程分层——从能运行到可替换、可维护

> **文档定位**：90 分钟分享讲义 + 会后自学手册 + 现场答疑参考 + 完整重构案例
> **目标受众**：熟悉 JavaScript / TypeScript，完成 Day1 Java 基础学习，准备转向 Java 全栈与 Agent 应用开发的前端工程师
> **基准环境**：macOS、JDK 21、IntelliJ IDEA、Maven
> **前置知识**：会创建类和方法，知道 `List` / `Set` / `Map`，能够运行 Day1 内存版用户管理系统
> **学习边界**：今天只讲纯 Java 对象设计和分层，不展开 Spring IoC、数据库、完整异常体系、Stream、JUnit 和复杂 DDD

---

## 0. 如何使用这份讲义

正文使用三种提示：

- **必须讲清**：分享结束后，听众应该能够独立复述。
- **现场演示**：建议在 IntelliJ IDEA 或终端中实际操作。
- **容易被问**：分享中很可能出现的追问，正文和 FAQ 都给出回答边界。
- **拓展内容**：会后深挖，不占用 90 分钟主线。
- **故意错误示例**：用于观察编译错误或设计问题，不能作为推荐写法复制。

建议分两种方式使用：

1. **现场分享**：沿着第 1～7 节主线讲，控制在 90 分钟。
2. **会后自学**：继续阅读 FAQ、练习、检查清单和完整代码附录。

### 0.1 今天的学习目标

学完后，你应该能够：

1. 从状态、行为和不变量三个角度解释“对象”是什么。
2. 说明封装不等于“字段加 `private`”，而是保护对象的有效状态。
3. 准确解释 Java 四种访问级别以及 `protected` 的使用边界。
4. 说清 Java 接口与 TypeScript 接口的真实差异。
5. 根据场景选择接口、抽象类、组合或继承。
6. 解释编译期类型、运行时对象、重写和动态分派。
7. 区分依赖注入（DI）和依赖倒置原则（DIP）。
8. 说清 Entity、DTO、Command、`record` 和 `Map` 的不同职责。
9. 把一个混合所有职责的 `UserManager` 重构为清晰的分层结构。
10. 说明为什么 `UserService` 应依赖 `UserRepository`，而不是直接依赖 `LinkedHashMap`。

### 0.2 建议分享时间

| 时间 | 内容 | 目标 |
|---|---|---|
| 0–10 分钟 | 回顾 Day1、阅读反例 | 看见“能运行”和“可维护”的差距 |
| 10–27 分钟 | 对象、封装、不变量、访问控制 | 理解对象如何保护有效状态 |
| 27–45 分钟 | 接口、抽象类、组合、继承、多态 | 建立类型与替换的心智模型 |
| 45–60 分钟 | 分层、Repository、DI 与 DIP | 理解依赖方向和职责边界 |
| 60–80 分钟 | 用户系统逐步重构 | 把原则落到可运行代码 |
| 80–90 分钟 | 设计复盘和高频答疑 | 能解释取舍而不背口号 |

### 0.3 今天只有一条主线

> Day1 让代码“能运行”；Day2 要让业务规则不依赖具体存储方式，使代码“可替换、可测试、可演进”。

面向对象不是“多写几个 class”，分层也不是“多建几个文件夹”。它们要解决的是：

- 修改存储方式时，业务规则是否被迫一起修改？
- 修改输出方式时，数据存取是否被迫一起修改？
- 阅读一个类时，能否快速说出它负责什么、不负责什么？
- 错误数据能否绕过入口，让对象进入无效状态？
- 新实现能否在不修改调用方的前提下替换旧实现？

### 0.4 内容导航

- [1. 从一个能运行但难维护的类开始](#1-从一个能运行但难维护的类开始)
- [2. 对象、封装与不变量](#2-对象封装与不变量)
- [3. 接口、抽象类、组合与继承](#3-接口抽象类组合与继承)
- [4. 多态与动态分派](#4-多态与动态分派)
- [5. 分层、Repository、DI 与 DIP](#5-分层repositorydi-与-dip)
- [6. 校验到底应该放在哪里](#6-校验到底应该放在哪里)
- [7. 逐步重构用户管理系统](#7-逐步重构用户管理系统)
- [8. 高频追问](#8-分享时必须能回答的高频问题)
- [9. 练习题](#9-练习题)
- [10. 练习答案](#10-练习答案)
- [11. 一页检查清单](#11-一页检查清单)
- [附录 A：完整可运行代码](#附录-a完整可运行代码)

---

## 1. 从一个能运行但难维护的类开始

### 1.1 需求看起来很简单

继续使用 Day1 的用户管理需求：

- 创建用户；
- 按 ID 查询用户；
- 更新用户资料；
- 删除用户；
- 列出全部用户；
- 邮箱不能重复；
- 技能去重并保留第一次出现的顺序。

初学者很容易把所有逻辑写进一个类。

> **故意设计的反例：下面代码用于识别问题，不是最终推荐写法。**

```java
public class UserManager {
    private final Map<Long, Map<String, Object>> users = new LinkedHashMap<>();
    private long nextId = 1L;

    public void create(String name, String email, List<String> skills) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name 不能为空");
        }

        for (Map<String, Object> user : users.values()) {
            if (email.equalsIgnoreCase((String) user.get("email"))) {
                throw new IllegalArgumentException("邮箱已存在");
            }
        }

        Map<String, Object> user = new HashMap<>();
        user.put("id", nextId);
        user.put("name", name.trim());
        user.put("email", email.trim().toLowerCase());
        user.put("skills", new LinkedHashSet<>(skills));
        users.put(nextId++, user);

        System.out.println("创建成功: " + user);
    }
}
```

它可以运行，甚至在数据量很小时“看起来够用”。但它同时承担：

1. 接收输入；
2. 校验名称；
3. 校验邮箱唯一；
4. 生成 ID；
5. 选择集合结构；
6. 保存用户；
7. 负责控制台输出；
8. 用字符串 Key 描述业务数据。

### 1.2 具体问题，而不是抽象口号

#### 问题一：稳定业务结构被字符串 Key 隐藏

```java
user.put("emial", email); // 拼写错误，编译器不会提醒
```

`Map<String, Object>` 无法给出：

- 字段名自动补全；
- 字段类型检查；
- 构造时的完整性检查；
- 安全重命名；
- 明确的公开契约。

#### 问题二：业务规则和存储实现耦合

邮箱唯一检查直接遍历 `users.values()`。如果将来切换 MySQL：

- 不能继续遍历内存 Map；
- `UserManager` 必须改写查询逻辑；
- 业务逻辑与 SQL / ORM 逻辑混在一起；
- 修改风险扩散到整个类。

#### 问题三：输出方式和业务流程耦合

`System.out.println()` 写在创建流程里。以后改成 REST API、消息事件或 GUI 时，业务方法仍然被控制台输出绑住。

#### 问题四：类的变化原因太多

以下任何变化都会修改 `UserManager`：

- 用户字段变化；
- 邮箱规则变化；
- 数据库变化；
- ID 生成策略变化；
- 输出格式变化；
- 错误处理方式变化。

“一个类只有一个变化原因”是单一职责原则的常见表达。不要把它理解成“一个类只能有一个方法”，而要问：这些代码是否因为同一种业务原因一起变化？

> **必须讲清**：判断设计好坏不能只看代码行数，要看变化是否被限制在合理边界内。

> **现场演示**：要求听众指出“把内存 Map 换成数据库”时，需要修改反例中的哪些代码。

> **容易被问**：小项目真的需要分层吗？答案不是“一定需要”，而是当业务规则、存储方式或交付形式可能独立变化时，边界就开始产生价值。

### 1.3 重构目标

我们希望得到下面的依赖关系：

```text
App（组装和演示）
 │
 ▼
UserService（业务用例与跨对象规则）
 │ 只依赖接口
 ▼
UserRepository（存储契约）
 ▲
 │ 实现接口
InMemoryUserRepository（集合与 ID 生成细节）

User（保护用户自身有效状态）
Command record（明确表达用例输入）
```

重构完成后：

- `UserService` 不知道底层使用 `Map` 还是数据库；
- `User` 不允许名称为空、邮箱非法；
- `App` 负责创建对象并连接依赖；
- `Command` 明确表达每个用例需要哪些输入；
- 内存集合只出现在基础设施实现中。

---

## 2. 对象、封装与不变量

### 2.1 对象不只是“一组字段”

理解对象可以从三个角度开始：

| 角度 | 用户对象中的例子 | 要回答的问题 |
|---|---|---|
| 状态 State | `id`、`name`、`email`、`skills` | 对象现在是什么样？ |
| 行为 Behavior | `withId()`、`updateProfile()` | 对象允许怎样变化？ |
| 不变量 Invariant | 名称非空、邮箱合法、技能集合不可被外部直接修改 | 对象任何时候都必须满足什么？ |

如果一个类只有公开字段，并允许任何调用方随意改值，它只是一个缺少保护的数据容器。

```java
public class User {
    public String name;
    public String email;
}

User user = new User();
user.name = "";
user.email = "not-an-email";
```

这段代码允许 `User` 进入无效状态，后续每一个使用者都要重新猜测和检查。

### 2.2 封装不等于“字段 private + 自动生成 getter/setter”

下面的写法形式上字段是私有的，但仍然允许任意无效修改：

```java
public final class User {
    private String name;

    public void setName(String name) {
        this.name = name;
    }
}
```

更有意义的封装应当：

1. 隐藏不需要对外公开的表示细节；
2. 只暴露符合业务语义的行为；
3. 在创建和变化时保护不变量；
4. 减少外部代码对内部结构的依赖。

```java
public User updateProfile(String newName, Set<String> newSkills) {
    return new User(id, requireText(newName, "name"), email, newSkills);
}
```

`updateProfile` 比 `setName`、`setSkills` 更接近业务动作，而且可以一次完成相关字段的校验与更新。

> **必须讲清**：封装的目的不是少写 getter，而是让无效状态更难被创建。

### 2.3 构造器建立对象的初始有效状态

```java
private User(Long id, String name, String email, Set<String> skills) {
    this.id = id;
    this.name = requireText(name, "name");
    this.email = requireEmail(email);
    this.skills = immutableSkills(skills);
}
```

如果构造器成功返回，调用方就可以假设：

- `name` 有有效文本；
- `email` 至少满足本案例的基础格式；
- `skills` 不为 null；
- 外部不能直接修改内部技能集合。

构造器不是唯一入口。静态工厂可以让创建意图更清楚：

```java
public static User create(String name, String email, Set<String> skills) {
    return new User(null, name, email, skills);
}
```

`new User(...)` 只能表达“调用构造器”；`User.create(...)` 可以表达“创建一个尚未持久化的新用户”。

### 2.4 `final` 到底保证什么

```java
private final Set<String> skills;
```

`final` 保证字段在构造完成后不能重新指向另一个 Set：

```java
// this.skills = anotherSet; // final 字段不能再次赋值
```

但 `final` 不会自动让对象变成不可变：

```java
final List<String> names = new ArrayList<>();
names.add("Alice"); // 合法，引用不变，List 内容改变
```

因此集合字段需要防御性复制：

```java
private static Set<String> immutableSkills(Set<String> source) {
    if (source == null || source.isEmpty()) {
        return Set.of();
    }
    return Collections.unmodifiableSet(new LinkedHashSet<>(source));
}
```

为什么不是直接保存 `source`？

```java
Set<String> input = new LinkedHashSet<>(List.of("Java"));
User user = User.create("Alice", "alice@example.com", input);
input.add("Injected");
```

如果直接保存引用，调用方在构造后仍能从外部改变用户状态，封装就被绕过了。

为什么 getter 也不能直接返回可变内部集合？

```java
user.getSkills().clear(); // 如果返回可变内部集合，就能绕过业务行为
```

> **现场演示**：删除防御性复制，修改输入集合，观察对象内容被“隔空改变”。

### 2.5 不可变对象与“返回新对象更新”

本案例使用：

```java
public User updateProfile(String newName, Set<String> newSkills) {
    return new User(id, newName, email, newSkills);
}
```

而不是原地修改字段。优点包括：

- 对象变化路径更容易追踪；
- 不会出现更新一半的临时状态；
- 更适合缓存、并发读取和测试；
- 旧对象仍保持原值。

代价包括：

- 每次修改会创建新对象；
- 与部分 ORM 的实体生命周期模型需要协调；
- 大型对象复制要考虑成本。

所以准确结论是：不可变设计是一个很好的默认起点，但不是所有 Java 实体必须不可变。

### 2.6 四种访问级别

| 修饰符 | 当前类 | 同包 | 不同包子类 | 其他代码 |
|---|:---:|:---:|:---:|:---:|
| `public` | ✓ | ✓ | ✓ | ✓ |
| `protected` | ✓ | ✓ | 有条件 | ✗ |
| 无修饰符（package-private） | ✓ | ✓ | ✗ | ✗ |
| `private` | ✓ | ✗ | ✗ | ✗ |

#### `public`

属于对外契约。跨包使用的 `User`、`UserService`、`UserRepository` 必须公开。

#### package-private

没有写访问修饰符时，成员或顶级类型只对同包代码可见：

```java
final class EmailRules {
    // 只在当前包内部使用
}
```

它适合隐藏包内实现细节，不必为了“看起来统一”把所有类型都声明成 `public`。

#### `private`

只允许当前顶级类及其嵌套范围访问。字段、内部校验方法、实现细节通常优先 `private`。

#### `protected`

`protected` 同时包含：

- 同包访问；
- 不同包子类中的受限访问。

它不是“比 package-private 稍微公开一点”那么简单，并且容易让子类依赖父类内部状态。没有明确继承扩展点时，不要为了“以后可能用到”而写 `protected`。

> **容易被问**：为什么 getter 是 `public`，字段却是 `private`？因为方法可以维持稳定契约、计算或校验，而字段公开会暴露内部表示并让调用方直接耦合。

### 2.7 包不是文件夹装饰

本案例按职责组织包：

```text
com.example.day2
├── bootstrap       对象组装和程序入口
├── application     用例编排
│   ├── command     用例输入
│   └── port        应用需要的外部能力契约
├── domain          业务对象和自身不变量
└── infrastructure  内存、数据库等技术实现
```

包带来：

- 命名空间；
- package-private 访问边界；
- 依赖方向的可见结构；
- 对外 API 与内部实现的区分。

但文件夹多不等于架构好。一个只有三四个类的小练习可以先保持简单；本案例拆包是为了练习未来 Spring 项目的依赖方向。

---

## 3. 接口、抽象类、组合与继承

### 3.1 接口表达“调用方需要什么”

```java
public interface UserRepository {
    User save(User user);

    Optional<User> findById(Long id);

    List<User> findAll();

    boolean existsByEmail(String email, Long excludedUserId);

    boolean deleteById(Long id);
}
```

这个接口没有描述：

- 使用 `HashMap` 还是 `LinkedHashMap`；
- 是否执行 SQL；
- 数据是否来自远程服务；
- ID 如何生成；
- 查询语句如何优化。

它只描述应用层完成用户用例所需的存储能力。

> **必须讲清**：接口应该从使用者的需求出发，而不是机械复制实现类的所有 public 方法。

### 3.2 Java 接口不只是“抽象方法列表”

接口可以包含：

```java
public interface MessageSender {
    // 隐式 public abstract
    void send(String message);

    // 有实现的实例方法
    default void sendWelcome(String name) {
        send("Welcome, " + normalize(name));
    }

    // 通过接口名调用，不参与实例多态
    static MessageSender noop() {
        return message -> { };
    }

    // 供接口内部 default/static 方法复用
    private static String normalize(String value) {
        return value == null ? "guest" : value.trim();
    }
}
```

还要注意：

- 接口字段隐式是 `public static final` 常量；
- 接口没有普通实例字段；
- 抽象实例方法隐式是 `public abstract`；
- 类可以实现多个接口；
- 接口也可以继承多个接口；
- `default` 方法主要用于接口演进和共享合理默认行为，不应用来堆积复杂状态逻辑。

### 3.3 Java 接口与 TypeScript 接口的真实差异

#### TypeScript：以结构兼容为主

```typescript
interface UserRepository {
  findById(id: number): User | undefined;
}

const repository = {
  findById(id: number) {
    return undefined;
  }
};

const value: UserRepository = repository; // 结构满足即可
```

#### Java：名义类型关系

```java
public final class InMemoryUserRepository implements UserRepository {
    // 必须显式 implements，并实现接口契约
}
```

即使某个 Java 类恰好拥有完全相同的方法，只要没有声明 `implements UserRepository`，它就不是 `UserRepository`。

| 维度 | TypeScript interface | Java interface |
|---|---|---|
| 主要兼容方式 | 结构化类型 | 名义类型 |
| 运行产物 | 通常类型擦除，不直接存在于 JS 运行时 | 进入字节码，JVM 可识别实现关系 |
| 实现声明 | 不一定显式 `implements` | 类需显式 `implements` |
| 方法实现 | 不能直接提供普通运行时实现 | 可有 default、static、private 方法 |
| 实例状态 | 只描述结构 | 不能持有普通实例字段 |
| 多实现 | 一个对象可结构上满足多个接口 | 一个类可显式实现多个接口 |

有限类比很有帮助，但不要把 Java 接口理解成“运行在 JVM 上的 TypeScript interface”。

### 3.4 接口还是抽象类

| 需求 | 优先考虑接口 | 优先考虑抽象类 |
|---|:---:|:---:|
| 描述能力或调用契约 | ✓ |  |
| 一个类需要拥有多个能力 | ✓ |  |
| 不相关类型共享同一能力 | ✓ |  |
| 需要共享实例字段 |  | ✓ |
| 需要 `protected` 模板步骤 |  | ✓ |
| 子类确实具有共同基类身份 |  | ✓ |
| 需要控制构造过程 |  | ✓ |

例子：

- `UserRepository` 是存储能力契约，适合接口。
- 如果多种批处理任务共享状态、构造参数和模板执行流程，可能适合抽象基类。

抽象类不是“接口的高级版”，接口也不是“没有字段的抽象类”。它们表达的关系不同：

- 接口更偏向“能做什么”；
- 抽象类更偏向“是什么，并共享哪些实现和状态”。

### 3.5 组合优先于继承是什么意思

组合是“一个对象持有并使用另一个对象”：

```java
public final class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }
}
```

继承是“子类属于父类的一种”：

```java
class Animal { }
class Dog extends Animal { }
```

不推荐为了复用两行代码建立不真实的继承关系：

```java
// 错误建模：Service 并不是一种 Repository
class UserService extends InMemoryUserRepository { }
```

组合的优势：

- 依赖可以替换；
- 不暴露父类内部实现；
- 不受 Java 单继承限制；
- 关系在字段和构造器中清晰可见；
- 可以在运行时选择不同协作者。

但“组合优先”不是“永远禁止继承”。真正稳定的 `is-a` 关系、框架定义的扩展点、受控模板方法仍可能适合继承。

### 3.6 什么时候不需要接口

以下情况通常不用急着抽接口：

- 纯数据载体 record；
- 没有替换需求的简单工具类；
- 只有调用方和实现方都完全相同的内部小类；
- 接口只机械复制实现类，无法表达独立契约；
- 为了满足“一类一接口”的团队习惯而创建空洞层次。

值得考虑接口的信号：

- 外部系统边界：数据库、文件、HTTP、消息、模型服务；
- 已经存在或明确将出现多个实现；
- 调用方只应看见一小部分能力；
- 需要隔离易变化的技术细节；
- 接口本身能表达稳定、可解释的业务契约。

> **容易被问**：现在只有内存实现，为什么先写 `UserRepository`？因为存储是明确的外部边界，后续数据库替换已经在学习路线中，不是凭空猜测。

---

## 4. 多态与动态分派

### 4.1 编译期类型与运行时对象

```java
UserRepository repository = new InMemoryUserRepository();
```

- 变量 `repository` 的**编译期类型**是 `UserRepository`；
- 它当前引用的**运行时对象**是 `InMemoryUserRepository`；
- 编译器只允许调用 `UserRepository` 契约中可见的方法；
- 实际执行哪个重写方法，由运行时对象决定。

```java
repository.save(user);
```

运行时会执行 `InMemoryUserRepository.save()`。

### 4.2 重写与重载不要混淆

#### 重写 Override

子类或实现类提供相同签名的实例方法实现：

```java
@Override
public User save(User user) {
    // InMemoryUserRepository 的实现
}
```

使用 `@Override` 可以让编译器帮助发现签名拼错。

#### 重载 Overload

同一个类型中，方法名相同但参数列表不同：

```java
void send(String message) { }
void send(String message, int retryCount) { }
```

重载在编译期根据参数类型选择，不是运行时多态的核心机制。

### 4.3 动态分派示例

```java
interface Greeting {
    String message();
}

final class ChineseGreeting implements Greeting {
    @Override
    public String message() {
        return "你好";
    }
}

final class EnglishGreeting implements Greeting {
    @Override
    public String message() {
        return "Hello";
    }
}

static void print(Greeting greeting) {
    System.out.println(greeting.message());
}

print(new ChineseGreeting()); // 你好
print(new EnglishGreeting()); // Hello
```

`print()` 不需要 `if/else` 判断具体实现。只要新类型遵守 `Greeting` 契约，调用方就可以复用。

### 4.4 向上转型与向下转型

```java
UserRepository repository = new InMemoryUserRepository(); // 向上转型，安全
```

向下转型意味着调用方开始依赖具体实现：

```java
InMemoryUserRepository memory =
        (InMemoryUserRepository) repository;
```

如果运行时对象不是该类型，就会抛出 `ClassCastException`。业务层频繁向下转型通常说明接口缺少真正需要的能力，或调用方越过了抽象边界。

> **必须讲清**：多态的价值不是少写一次 `new`，而是让调用者围绕稳定契约编程。

> **现场演示**：在 `App` 中只修改 `new InMemoryUserRepository()` 这一处，说明其他层为什么无需知道具体集合。

### 4.5 `static` 方法不参与实例动态分派

静态方法属于声明它的类型，通过类型名调用：

```java
MessageSender sender = MessageSender.noop();
```

实例方法的重写与运行时对象相关；静态方法发生隐藏（hiding）时，选择取决于编译期类型，不是实例多态。不要为了“统一写法”用实例引用调用静态方法。

---

## 5. 分层、Repository、DI 与 DIP

### 5.1 分层先回答职责，而不是先建目录

本案例使用四类角色：

| 层 / 角色 | 负责什么 | 不负责什么 |
|---|---|---|
| `bootstrap.App` | 创建对象、连接依赖、演示用例 | 业务校验、集合存取 |
| `application.UserService` | 编排用例、跨对象业务规则 | 决定使用哪种集合、打印 UI |
| `domain.User` | 用户自身状态、行为和不变量 | 查询其他用户、连接数据库 |
| `application.port.UserRepository` | 定义应用所需存储契约 | 具体 Map、SQL 实现 |
| `infrastructure.InMemoryUserRepository` | 用集合保存和查询用户 | 决定用户是否允许创建 |

注意：`UserRepository` 放在 `application.port`，因为接口由应用层的需求定义；基础设施实现它。也有项目把 Repository 接口放在 domain 包，关键不是固定文件夹答案，而是依赖方向和团队约定一致。

### 5.2 Repository 不是“换个名字的 Map”

Repository 提供面向业务对象的存取契约：

```java
Optional<User> findById(Long id);
boolean existsByEmail(String email, Long excludedUserId);
```

它隐藏：

- 数据结构；
- 查询语言；
- 连接管理；
- 持久化框架；
- ID 分配的技术实现。

但不要让 Repository 吞掉所有业务规则。比如“邮箱是否允许重复”是业务决策：

```java
if (repository.existsByEmail(email, null)) {
    throw new IllegalArgumentException("邮箱已存在: " + email);
}
```

Repository 回答“是否存在”；Service 决定“存在时禁止创建”。

### 5.3 DAO 与 Repository 的边界

工程中两个名称经常混用，可以先用以下心智模型：

- DAO 更偏数据表、查询和持久化操作；
- Repository 更偏领域对象集合的抽象；
- 小项目里可能由同一个类同时承担；
- 名称不如职责和契约重要。

不要把“叫 Repository”当成架构自动变好的证明。

### 5.4 依赖注入 DI

```java
public final class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = Objects.requireNonNull(repository);
    }
}
```

依赖注入描述的是：依赖由外部提供，而不是类内部自行创建。

#### 不注入：Service 自己决定实现

```java
public UserService() {
    this.repository = new InMemoryUserRepository();
}
```

问题：

- Service 与具体实现绑定；
- 调用方不能选择数据库实现；
- 测试时难以替换为可控实现；
- 对象创建职责混入业务类。

#### 构造器注入：依赖显式、完整

```java
UserRepository repository = new InMemoryUserRepository();
UserService service = new UserService(repository);
```

构造器注入通常是默认选择，因为：

- 对象创建后依赖完整；
- 字段可以声明为 `final`；
- 依赖清楚展示在构造器签名中；
- 不需要先创建半成品对象再调用 setter。

### 5.5 依赖倒置原则 DIP

依赖倒置的核心不是“使用了 interface”这么简单，而是：

1. 高层业务策略不依赖低层技术细节；
2. 两者依赖稳定抽象；
3. 抽象由高层需要的能力塑造，而不是由低层实现随意决定。

```text
源码依赖方向：

UserService ───────► UserRepository ◄────── InMemoryUserRepository
  高层业务              抽象契约                 低层细节
```

如果没有接口：

```text
UserService ───────► InMemoryUserRepository ───────► LinkedHashMap
```

业务层直接知道低层细节。

### 5.6 DI 与 DIP 的区别

| 概念 | 回答的问题 | 本案例 |
|---|---|---|
| DI（依赖注入） | 依赖对象如何交给使用者？ | `new UserService(repository)` |
| DIP（依赖倒置） | 高层和低层应该依赖谁？ | 都围绕 `UserRepository` 契约 |

可以依赖注入一个具体类，但仍没有做到依赖倒置：

```java
public UserService(InMemoryUserRepository repository) { }
```

也可以手工完成 DI，无需 Spring：

```java
UserRepository repository = new InMemoryUserRepository();
UserService service = new UserService(repository);
```

后续 Spring 的核心价值之一，是根据配置和元数据自动创建、管理并注入这些对象；它不会替你自动设计正确的职责边界。

> **必须讲清**：Spring DI 是对象组装工具，不是“写了 `@Service` 就自动拥有好架构”。

### 5.7 对象组装发生在哪里

`App` 是 Composition Root（组合根）：

```java
public static void main(String[] args) {
    UserRepository repository = new InMemoryUserRepository();
    UserService service = new UserService(repository);
    // 调用业务用例
}
```

组合根集中决定：

- 使用哪个 Repository 实现；
- 各对象按什么顺序创建；
- 谁依赖谁；
- 应用从哪里启动。

业务对象不应散落着 `new` 各种基础设施依赖，否则替换仍然困难。

### 5.8 依赖方向图

```text
                      运行时对象连接
┌───────────────┐     ┌───────────────┐     ┌────────────────────────┐
│ bootstrap.App │ ──► │  UserService  │ ──► │ InMemoryUserRepository │
└───────────────┘     └───────────────┘     └────────────────────────┘
                              │                         │
                              │ 编译期依赖              │ implements
                              ▼                         ▼
                       ┌──────────────────────────────────┐
                       │        UserRepository            │
                       └──────────────────────────────────┘
```

运行时 `UserService` 确实持有一个内存实现对象，但源码中字段类型是 `UserRepository`。这就是“运行时连接具体对象，编译期依赖稳定契约”。

---

## 6. 校验到底应该放在哪里

“所有校验都放 Service”同样会形成巨型类。可以按规则性质分配。

### 6.1 四类校验

| 规则 | 推荐起点 | 原因 |
|---|---|---|
| 请求字段能否解析、长度格式、必填 | 系统边界 / DTO 校验 | 尽早拒绝无效输入，给调用者清晰错误 |
| 用户自身始终必须满足的条件 | `User` 领域对象 | 防止任何入口创建无效 User |
| 邮箱在所有用户中唯一 | `UserService` + Repository 查询 | 涉及其他对象或外部状态 |
| 数据类型、约束和存取行为 | Repository / 数据库 | 属于持久化能力和最后防线 |

在当前纯 Java 命令行案例中没有 Controller，所以 Service 同时承担部分输入标准化；后续进入 Spring 后，可以把 HTTP 层格式校验前移，但领域对象自身不变量仍不能完全依赖 Controller。

### 6.2 对象自身不变量

```java
private User(Long id, String name, String email, Set<String> skills) {
    this.name = requireText(name, "name");
    this.email = requireEmail(email);
}
```

无论用户来自命令行、REST、定时任务还是消息队列，`User` 都不应允许空名称或明显非法邮箱。

### 6.3 跨对象规则

```java
if (repository.existsByEmail(normalizedEmail, null)) {
    throw new IllegalArgumentException("邮箱已存在: " + normalizedEmail);
}
```

一个 User 无法只看自己判断“整个系统里是否已有相同邮箱”。该规则需要 Repository 查询，因此由应用服务编排。

### 6.4 数据库约束仍然必要

进入数据库课程后，邮箱唯一通常还需要唯一索引。原因是：

- 两个并发请求都可能先查到“不存在”；
- 随后同时插入；
- 只靠应用层先查再写不能提供最终并发保证。

今天不展开事务和并发，只先建立边界：应用层表达业务意图，数据库约束提供持久化层最后防线。

### 6.5 重复校验是不是坏事

不同层的校验可能看起来重复，但目的不同：

- 边界校验为了尽快返回友好错误；
- 领域校验为了保证对象永远有效；
- 数据库约束为了保证最终数据一致。

坏的重复是相同业务规则散落多处、修改时容易不一致；合理的多层防线是各层保护自己的契约。

> **容易被问**：邮箱格式应该写多复杂？本案例只做基础检查。完整 RFC 邮箱规则复杂，生产项目通常结合成熟校验器、业务允许范围和验证邮件，不要手写一个看似完美的巨大正则。

---

## 7. 逐步重构用户管理系统

### 7.1 最终目录

```text
day2-user-management/
├── pom.xml
└── src/main/java/com/example/day2/
    ├── bootstrap/
    │   └── App.java
    ├── application/
    │   ├── UserService.java
    │   ├── command/
    │   │   ├── CreateUserCommand.java
    │   │   └── UpdateUserProfileCommand.java
    │   └── port/
    │       └── UserRepository.java
    ├── domain/
    │   └── User.java
    └── infrastructure/
        └── InMemoryUserRepository.java
```

### 7.2 第一步：用 User 替换业务 Map

稳定字段值得显式类型：

```java
User alice = User.create(
        "Alice",
        "alice@example.com",
        Set.of("Java", "TypeScript")
);
```

获得：

- 编译期字段类型；
- 集中的不变量；
- 可搜索的方法调用；
- IDE 安全重构；
- 明确的相等语义和字符串表示。

`Map` 仍适合动态属性、索引、统计结果和基础设施内部结构。这里不是消灭 Map，而是不让 Map 冒充稳定业务对象。

### 7.3 第二步：用 Command 表达用例输入

```java
public record CreateUserCommand(
        String name,
        String email,
        List<String> skills
) { }
```

```java
public record UpdateUserProfileCommand(
        Long id,
        String name,
        List<String> skills
) { }
```

Command 的价值：

- 方法参数不再无限增长；
- 输入字段组成一个有名称的概念；
- 创建与更新可以拥有不同字段；
- 将来更容易在边界层做映射和校验；
- 避免直接暴露领域对象作为所有入口的万能输入。

`record` 的字段引用不可重新赋值，但如果字段指向可变 List，List 内容并不会自动深度不可变。本案例在 Service 中读取输入并立即转换，不长期保存 Command。

### 7.4 第三步：从应用需求定义 Repository 接口

```java
public interface UserRepository {
    User save(User user);
    Optional<User> findById(Long id);
    List<User> findAll();
    boolean existsByEmail(String email, Long excludedUserId);
    boolean deleteById(Long id);
}
```

逐个解释：

- `save` 同时支持新建和保存更新后的对象；
- `findById` 用 `Optional` 明确表达可能不存在；
- `findAll` 返回业务对象列表，不暴露内部 Map；
- `existsByEmail` 支持排除当前用户 ID，为未来修改邮箱预留正确语义；
- `deleteById` 返回是否实际删除，调用方可以决定如何解释结果。

接口方法不是越多越好。不要把 `clear()`、`getInternalMap()` 等实现细节泄露出去。

### 7.5 第四步：把集合细节关进内存实现

```java
public final class InMemoryUserRepository implements UserRepository {
    private final Map<Long, User> users = new LinkedHashMap<>();
    private long nextId = 1L;
}
```

选择 `LinkedHashMap`：

- ID 到 User 的查找语义清楚；
- 按 ID 查询平均接近 O(1)；
- 迭代保持插入顺序，演示输出稳定；
- 具体集合不暴露到应用层。

```java
@Override
public List<User> findAll() {
    return List.copyOf(users.values());
}
```

返回快照，调用方不能通过返回列表增删 Repository 内部数据。

### 7.6 第五步：Service 编排业务用例

```java
public User create(CreateUserCommand command) {
    Objects.requireNonNull(command, "command 不能为空");

    String name = normalizeText(command.name(), "name");
    String email = normalizeEmail(command.email());
    Set<String> skills = normalizeSkills(command.skills());

    if (repository.existsByEmail(email, null)) {
        throw new IllegalArgumentException("邮箱已存在: " + email);
    }

    return repository.save(User.create(name, email, skills));
}
```

流程可以读成业务语言：

1. 确认命令存在；
2. 标准化输入；
3. 检查邮箱唯一；
4. 创建有效 User；
5. 保存并返回。

Service 没有 `Map`、`nextId`、SQL 或打印语句。

### 7.7 第六步：启动类集中组装

```java
UserRepository repository = new InMemoryUserRepository();
UserService service = new UserService(repository);
```

将来加入数据库实现时，目标结构是：

```java
UserRepository repository = new JdbcUserRepository(dataSource);
UserService service = new UserService(repository);
```

`UserService` 的构造器和业务方法无需改变。这里先表达设计目标，不在 Day2 实现 JDBC。

### 7.8 完整业务演示

```java
User alice = service.create(new CreateUserCommand(
        " Alice ",
        "ALICE@example.com",
        List.of("Java", "TypeScript", "Java", " ")
));

User bob = service.create(new CreateUserCommand(
        "Bob",
        "bob@example.com",
        List.of("Vue", "Java")
));

service.listAll().forEach(System.out::println);

User updated = service.updateProfile(new UpdateUserProfileCommand(
        alice.getId(),
        "Alice Chen",
        List.of("Java", "Spring", "Spring")
));
```

### 7.9 一次创建操作的完整调用链

执行：

```java
User alice = service.create(new CreateUserCommand(
        " Alice ",
        "ALICE@example.com",
        List.of("Java", "TypeScript", "Java", " ")
));
```

运行时依次发生：

```text
bootstrap.App.main()
  │ 创建 CreateUserCommand，并把用例交给 Service
  ▼
application.UserService.create(command)
  ├─ 检查 command 不为 null
  ├─ name：trim 并检查非空
  ├─ email：trim、转小写并检查格式
  ├─ skills：过滤空白、去重并保持顺序
  ├─ 调用 UserRepository.existsByEmail()
  ├─ 调用 User.create() 建立满足不变量、暂时没有 ID 的 User
  └─ 调用 UserRepository.save(user)
             │ 接口动态分派到当前实现
             ▼
infrastructure.InMemoryUserRepository.save(user)
  ├─ 判断当前 ID 为 null
  ├─ 分配 nextId
  ├─ 调用 user.withId(id) 返回一个新 User
  ├─ 保存进 LinkedHashMap<Long, User>
  └─ 返回已分配 ID 的 User
             │
             ▼
UserService 把结果返回 App，alice 保存该对象的引用
```

这条链同时体现四个关键点：

1. `App` 是组合根和用例发起者，不承载业务规则；
2. `UserService` 负责编排输入标准化与跨对象规则；
3. `User` 自己保证创建后的对象满足不变量；
4. Service 的源码只依赖 `UserRepository`，运行时由内存实现完成存取。

> **现场演示**：分别在 `UserService.create()`、`User.create()` 和 `InMemoryUserRepository.save()` 设置断点。观察 Command 原始值、标准化后的局部变量、分配 ID 前后的两个 User，以及 Map 新增的条目。

### 7.10 预期输出

```text
创建后:
User{id=1, name='Alice', email='alice@example.com', skills=[Java, TypeScript]}
User{id=2, name='Bob', email='bob@example.com', skills=[Vue, Java]}

按 ID 查询: Alice
更新后: User{id=1, name='Alice Chen', email='alice@example.com', skills=[Java, Spring]}
删除 Bob: true
剩余用户数: 1
重复邮箱校验: 邮箱已存在: alice@example.com
```

### 7.11 Day1 到 Day2 的结构升级

| Day1 重点 | Day2 升级 |
|---|---|
| 认识类、接口、集合 | 用职责和变化原因检查类设计 |
| 一个包内理解完整流程 | 用包表达应用、领域、端口和基础设施边界 |
| `UserService` 调 Repository | 解释 DI、DIP、编译期依赖和运行时组装 |
| `User` 保存明确字段 | 进一步强调不变量、静态工厂和防御性复制 |
| Command 作为 record 示例 | 用 Create / Update Command 表达不同用例输入 |
| 内存 Repository 能运行 | 明确集合细节只属于基础设施实现 |

Day2 不是否定 Day1，而是把 Day1 已经出现的结构讲深、拆清，并形成以后进入 Spring 时仍然适用的心智模型。

### 7.12 如何判断这次重构是否真的有价值

可以做四个问题检查：

1. 如果改成数据库，`UserService` 是否需要知道 SQL？不需要。
2. 如果改成 REST API，`UserRepository` 是否需要负责 JSON？不需要。
3. 如果名称校验变化，是否要修改内存存储？不需要。
4. 如果要保持列表输出顺序，修改点是否集中在 Repository 实现？是。

> **现场演示**：让听众在不打开 `InMemoryUserRepository` 的情况下，只根据 `UserRepository` 写出一段 Service 调用。

> **必须讲清**：分层价值来自变化隔离。如果每次需求变化仍要同时修改所有层，就要重新检查边界是否只是“形式分层”。

---

## 8. 分享时必须能回答的高频问题

> 本节按真实面试答题方式组织：先直接回答，再结合项目说明原理与边界，最后承接连续追问。不要逐字死背，应理解后用自己的语气表达。

### Q01. 面向对象是不是把所有东西都写成类？

**面试官提问**

> 面向对象是不是把所有东西都写成类？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不是。Java 以类和对象组织大量代码，但设计目标是建立清晰的状态、行为和边界。局部计算可以是简单方法，数据载体可以用 record，集合和基本类型也有各自价值。为了“面向对象”把每个动作都包装成空洞类，只会增加理解成本。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会沿着 App → UserService → UserRepository → InMemoryUserRepository 的依赖图说明职责和运行时调用，而不是只用设计原则名称作答。我还会主动说明适用边界：这个结论以 Day2 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会沿着 App → UserService → UserRepository → InMemoryUserRepository 的依赖图说明职责和运行时调用，而不是只用设计原则名称作答。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day2 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会沿着 App → UserService → UserRepository → InMemoryUserRepository 的依赖图说明职责和运行时调用，而不是只用设计原则名称作答。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day2 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不是。Java 以类和对象组织大量代码，但设计目标是建立清晰的状态、行为和边界。局部计算可以是简单方法，数据载体可以用 record，集合和基本类型也有各自价值。为了“面向对象”把每个动作都包装成空洞类，只会增加理解成本。真正落地时还要结合调用契约和运行边界验证。

---

### Q02. 封装是不是字段全部 private，再生成 getter/setter？

**面试官提问**

> 封装是不是字段全部 private，再生成 getter/setter？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不是。`private` 只是访问控制手段。封装的核心是隐藏表示细节、保护不变量、暴露有业务语义的行为。一个允许任意值的 public setter 可能仍然破坏封装。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。我还会主动说明适用边界：封装与注入的关键是让对象在创建和使用期间保持有效状态；private、final 或 setter 只是手段，不能自动替代不变量校验和清晰的依赖契约。

**结合当天项目**

Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 封装与注入的关键是让对象在创建和使用期间保持有效状态；private、final 或 setter 只是手段，不能自动替代不变量校验和清晰的依赖契约。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 封装与注入的关键是让对象在创建和使用期间保持有效状态；private、final 或 setter 只是手段，不能自动替代不变量校验和清晰的依赖契约。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不是。`private` 只是访问控制手段。封装的核心是隐藏表示细节、保护不变量、暴露有业务语义的行为。一个允许任意值的 public setter 可能仍然破坏封装。真正落地时还要结合调用契约和运行边界验证。

---

### Q03. 为什么 User 没有 `setName()`？

**面试官提问**

> 为什么 User 没有 `setName()`？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：本案例希望变化通过 `updateProfile()` 发生，并返回一个新的有效 User。这样可以一次表达业务动作、集中校验，并避免对象更新一半。生产项目是否使用可变实体，要结合 ORM、对象大小和生命周期决定。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。我还会主动说明适用边界：封装与注入的关键是让对象在创建和使用期间保持有效状态；private、final 或 setter 只是手段，不能自动替代不变量校验和清晰的依赖契约。

**结合当天项目**

Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 封装与注入的关键是让对象在创建和使用期间保持有效状态；private、final 或 setter 只是手段，不能自动替代不变量校验和清晰的依赖契约。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 封装与注入的关键是让对象在创建和使用期间保持有效状态；private、final 或 setter 只是手段，不能自动替代不变量校验和清晰的依赖契约。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 本案例希望变化通过 `updateProfile()` 发生，并返回一个新的有效 User。这样可以一次表达业务动作、集中校验，并避免对象更新一半。生产项目是否使用可变实体，要结合 ORM、对象大小和生命周期决定。真正落地时还要结合调用契约和运行边界验证。

---

### Q04. `final` 类、final 字段、final 方法分别是什么？

**面试官提问**

> `final` 类、final 字段、final 方法分别是什么？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：- `final class` 不能被继承；
- `final` 字段只能赋值一次，但引用对象内部仍可能可变；
- `final` 实例方法不能被子类重写；
- `final` 局部变量不能再次赋值。

它们都与“禁止重新定义某种关系”有关，但不自动等于深度不可变。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。我还会主动说明适用边界：final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**结合当天项目**

Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> `final class` 不能被继承；；真正落地时还要结合调用契约和运行边界验证。

---

### Q05. 为什么 User 声明为 final？

**面试官提问**

> 为什么 User 声明为 final？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：本案例没有设计继承扩展点。声明 `final` 可以避免子类改变相等、不变量和更新语义。不是所有领域类都必须 final，但“默认不为未设计的继承开放”通常比随意允许继承更安全。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。我还会主动说明适用边界：final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**结合当天项目**

Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 本案例没有设计继承扩展点。声明 `final` 可以避免子类改变相等、不变量和更新语义。不是所有领域类都必须 final，但“默认不为未设计的继承开放”通常比随意允许继承更安全。真正落地时还要结合调用契约和运行边界验证。

---

### Q06. Java 为什么只能继承一个类，却能实现多个接口？

**面试官提问**

> Java 为什么只能继承一个类，却能实现多个接口？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：类继承包含实例状态、构造过程和具体实现，多重类继承容易产生状态与方法来源冲突。Java 采用单类继承，并允许实现多个接口来组合能力契约。接口 default 方法也可能冲突，Java 要求实现类显式解决。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 类继承包含实例状态、构造过程和具体实现，多重类继承容易产生状态与方法来源冲突。Java 采用单类继承，并允许实现多个接口来组合能力契约。接口 default 方法也可能冲突，Java 要求实现类显式解决。真正落地时还要结合调用契约和运行边界验证。

---

### Q07. 接口有 default 方法后，和抽象类还有什么区别？

**面试官提问**

> 接口有 default 方法后，和抽象类还有什么区别？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：接口仍然没有普通实例字段和构造器，一个类可以实现多个接口。抽象类可以保存共享状态、定义构造过程、提供 protected 模板步骤，但一个类只能直接继承一个类。选择依据是关系和状态模型，不是方法有没有实现。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 接口仍然没有普通实例字段和构造器，一个类可以实现多个接口。抽象类可以保存共享状态、定义构造过程、提供 protected 模板步骤，但一个类只能直接继承一个类。选择依据是关系和状态模型，不是方法有没有实现。真正落地时还要结合调用契约和运行边界验证。

---

### Q08. 接口里的方法默认都是 public 吗？

**面试官提问**

> 接口里的方法默认都是 public 吗？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：抽象实例方法隐式是 `public abstract`；default 方法是 public；static 方法是 public，除非声明 private；接口还可以声明 private 实例或静态辅助方法。接口字段隐式是 `public static final`。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 抽象实例方法隐式是 `public abstract`；default 方法是 public；static 方法是 public，除非声明 private；接口还可以声明 private 实例或静态辅助方法。接口字段隐式是 `public static final`。真正落地时还要结合调用契约和运行边界验证。

---

### Q09. Java 接口和 TypeScript interface 最大的区别是什么？

**面试官提问**

> Java 接口和 TypeScript interface 最大的区别是什么？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：TypeScript 主要采用结构化类型，只要形状满足就可以兼容；Java 采用名义类型，类需要显式 `implements` 接口。Java 接口关系会进入字节码，且能包含 default/static/private 方法；TypeScript interface 通常在编译后被擦除。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> TypeScript 主要采用结构化类型，只要形状满足就可以兼容；Java 采用名义类型，类需要显式 `implements` 接口。Java 接口关系会进入字节码，且能包含 default/static/private 方法；TypeScript interface 通常在编译后被擦除。真正落地时还要结合调用契约和运行边界验证。

---

### Q10. 为什么不让 UserService 直接继承 Repository？

**面试官提问**

> 为什么不让 UserService 直接继承 Repository？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：Service 不是一种 Repository。Service 使用 Repository 完成业务用例，两者是组合关系。错误继承会把存储方法和内部细节暴露给 Service，并制造不真实的 `is-a` 关系。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> Service 不是一种 Repository。Service 使用 Repository 完成业务用例，两者是组合关系。错误继承会把存储方法和内部细节暴露给 Service，并制造不真实的 `is-a` 关系。真正落地时还要结合调用契约和运行边界验证。

---

### Q11. 依赖注入是不是只有 Spring 才能做？

**面试官提问**

> 依赖注入是不是只有 Spring 才能做？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不是。`new UserService(repository)` 已经是构造器注入。Spring 可以自动创建、管理和注入对象，但 DI 本身是普通对象协作方式。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，App 使用 new InMemoryUserRepository() 和 new UserService(repository) 完成手工构造器注入；Service 的参数类型是接口，因此同时体现依赖注入和高层面向抽象。我还会主动说明适用边界：这个结论以 Day2 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

App 使用 new InMemoryUserRepository() 和 new UserService(repository) 完成手工构造器注入；Service 的参数类型是接口，因此同时体现依赖注入和高层面向抽象。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day2 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** App 使用 new InMemoryUserRepository() 和 new UserService(repository) 完成手工构造器注入；Service 的参数类型是接口，因此同时体现依赖注入和高层面向抽象。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day2 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不是。`new UserService(repository)` 已经是构造器注入。Spring 可以自动创建、管理和注入对象，但 DI 本身是普通对象协作方式。真正落地时还要结合调用契约和运行边界验证。

---

### Q12. 使用构造器注入而不是 setter 注入有什么好处？

**面试官提问**

> 使用构造器注入而不是 setter 注入有什么好处？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：必需依赖在对象创建时就完整，字段可以 final，构造器签名明确展示依赖，对象不会存在“忘了调用 setter”的半初始化状态。可选依赖才可能考虑其他方式，但也应谨慎。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。我还会主动说明适用边界：封装与注入的关键是让对象在创建和使用期间保持有效状态；private、final 或 setter 只是手段，不能自动替代不变量校验和清晰的依赖契约。

**结合当天项目**

Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 封装与注入的关键是让对象在创建和使用期间保持有效状态；private、final 或 setter 只是手段，不能自动替代不变量校验和清晰的依赖契约。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 封装与注入的关键是让对象在创建和使用期间保持有效状态；private、final 或 setter 只是手段，不能自动替代不变量校验和清晰的依赖契约。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 必需依赖在对象创建时就完整，字段可以 final，构造器签名明确展示依赖，对象不会存在“忘了调用 setter”的半初始化状态。可选依赖才可能考虑其他方式，但也应谨慎。真正落地时还要结合调用契约和运行边界验证。

---

### Q13. DI 和 DIP 为什么不是一回事？

**面试官提问**

> DI 和 DIP 为什么不是一回事？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：DI 关注“依赖如何传进来”；DIP 关注“源码依赖应该指向哪种抽象”。把 `InMemoryUserRepository` 通过构造器传给 Service 是 DI，但如果构造器类型仍是具体类，高层仍依赖低层，没有充分做到 DIP。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，App 使用 new InMemoryUserRepository() 和 new UserService(repository) 完成手工构造器注入；Service 的参数类型是接口，因此同时体现依赖注入和高层面向抽象。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

App 使用 new InMemoryUserRepository() 和 new UserService(repository) 完成手工构造器注入；Service 的参数类型是接口，因此同时体现依赖注入和高层面向抽象。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** App 使用 new InMemoryUserRepository() 和 new UserService(repository) 完成手工构造器注入；Service 的参数类型是接口，因此同时体现依赖注入和高层面向抽象。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> DI 关注“依赖如何传进来”；DIP 关注“源码依赖应该指向哪种抽象”。把 `InMemoryUserRepository` 通过构造器传给 Service 是 DI，但如果构造器类型仍是具体类，高层仍依赖低层，没有充分做到 DIP。真正落地时还要结合调用契约和运行边界验证。

---

### Q14. 每一个 Service 都要对应一个接口吗？

**面试官提问**

> 每一个 Service 都要对应一个接口吗？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不需要。只有一个内部实现、没有独立调用契约或替换边界时，为 Service 创建同名接口可能只是增加跳转。Repository、外部 HTTP、文件、消息、模型服务等易变化边界通常更值得建立接口。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不需要。只有一个内部实现、没有独立调用契约或替换边界时，为 Service 创建同名接口可能只是增加跳转。Repository、外部 HTTP、文件、消息、模型服务等易变化边界通常更值得建立接口。真正落地时还要结合调用契约和运行边界验证。

---

### Q15. 为什么 Repository 接口放在 application，而实现放 infrastructure？

**面试官提问**

> 为什么 Repository 接口放在 application，而实现放 infrastructure？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：接口描述应用层需要的存储能力，应由高层需求塑造；基础设施提供实现。这样源码依赖从基础设施指向接口，而不是应用层指向基础设施。不同架构也会把 Repository 接口放 domain，关键是高层不依赖具体技术实现。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** App 以 UserRepository 编译期类型持有 InMemoryUserRepository 运行时对象，UserService 通过组合使用仓储；这能现场观察动态分派，也能解释为什么不把 Service 继承成 Repository。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 接口描述应用层需要的存储能力，应由高层需求塑造；基础设施提供实现。这样源码依赖从基础设施指向接口，而不是应用层指向基础设施。不同架构也会把 Repository 接口放 domain，关键是高层不依赖具体技术实现。真正落地时还要结合调用契约和运行边界验证。

---

### Q16. Repository 和 DAO 有标准、绝对的区别吗？

**面试官提问**

> Repository 和 DAO 有标准、绝对的区别吗？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：没有所有团队都遵守的唯一标准。常见理解是 DAO 更贴近数据表和查询，Repository 更像领域对象集合。小项目中一个类可能同时承担两种角色。应优先检查职责和方法契约，而不是只争论命名。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，内存 Repository 隐藏 LinkedHashMap、ID 分配和快照细节，Service 只依赖 save、findById 等应用需要的能力；以后换数据库时调用方契约不随存储结构变化。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

内存 Repository 隐藏 LinkedHashMap、ID 分配和快照细节，Service 只依赖 save、findById 等应用需要的能力；以后换数据库时调用方契约不随存储结构变化。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 内存 Repository 隐藏 LinkedHashMap、ID 分配和快照细节，Service 只依赖 save、findById 等应用需要的能力；以后换数据库时调用方契约不随存储结构变化。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 没有所有团队都遵守的唯一标准。常见理解是 DAO 更贴近数据表和查询，Repository 更像领域对象集合。小项目中一个类可能同时承担两种角色。应优先检查职责和方法契约，而不是只争论命名。真正落地时还要结合调用契约和运行边界验证。

---

### Q17. 为什么 `findById()` 返回 Optional，不直接返回 null？

**面试官提问**

> 为什么 `findById()` 返回 Optional，不直接返回 null？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：`Optional<User>` 在方法签名中显式表达“可能没有结果”，促使调用方处理缺失。Java 官方 API 也说明 Optional 主要适合作为明确表示无结果的方法返回类型。变量本身不应为 null，也不应机械把所有实体字段都改成 Optional。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，内存 Repository 隐藏 LinkedHashMap、ID 分配和快照细节，Service 只依赖 save、findById 等应用需要的能力；以后换数据库时调用方契约不随存储结构变化。我还会主动说明适用边界：Optional 主要用于返回值表达缺失，不应机械用于所有字段和参数；具体空值策略仍由业务契约决定。

**结合当天项目**

内存 Repository 隐藏 LinkedHashMap、ID 分配和快照细节，Service 只依赖 save、findById 等应用需要的能力；以后换数据库时调用方契约不随存储结构变化。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 Optional 主要用于返回值表达缺失，不应机械用于所有字段和参数；具体空值策略仍由业务契约决定。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 内存 Repository 隐藏 LinkedHashMap、ID 分配和快照细节，Service 只依赖 save、findById 等应用需要的能力；以后换数据库时调用方契约不随存储结构变化。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** Optional 主要用于返回值表达缺失，不应机械用于所有字段和参数；具体空值策略仍由业务契约决定。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> `Optional<User>` 在方法签名中显式表达“可能没有结果”，促使调用方处理缺失。Java 官方 API 也说明 Optional 主要适合作为明确表示无结果的方法返回类型。变量本身不应为 null，也不应机械把所有实体字段都改成 Optional。真正落地时还要结合调用契约和运行边界验证。

---

### Q18. 为什么不直接让 Service 返回 Map 或 JSON？

**面试官提问**

> 为什么不直接让 Service 返回 Map 或 JSON？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：Map 会丢失稳定结构的类型信息；JSON 属于传输表示。当前简单案例返回 User，后续 REST 层可映射为响应 DTO。这样业务层不依赖具体输出协议。

Stream 把数据源、中间操作和终止操作组成一次性流水线；中间操作通常惰性，终止操作触发遍历，map 一对一而 flatMap 处理一对多压平。在当前学习项目里，CreateUserCommand 与 UpdateUserProfileCommand 分开表达不同用例输入，User 表达身份与业务状态，响应 DTO 或 JSON 留给边界层，避免一个万能 Map 贯穿所有层。我还会主动说明适用边界：Map 不是绝对禁止；动态属性、适配层和临时聚合可以使用，但稳定业务契约更适合显式类型。

**结合当天项目**

CreateUserCommand 与 UpdateUserProfileCommand 分开表达不同用例输入，User 表达身份与业务状态，响应 DTO 或 JSON 留给边界层，避免一个万能 Map 贯穿所有层。

**原理与边界**

Stream 把数据源、中间操作和终止操作组成一次性流水线；中间操作通常惰性，终止操作触发遍历，map 一对一而 flatMap 处理一对多压平。 Map 不是绝对禁止；动态属性、适配层和临时聚合可以使用，但稳定业务契约更适合显式类型。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** CreateUserCommand 与 UpdateUserProfileCommand 分开表达不同用例输入，User 表达身份与业务状态，响应 DTO 或 JSON 留给边界层，避免一个万能 Map 贯穿所有层。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** Map 不是绝对禁止；动态属性、适配层和临时聚合可以使用，但稳定业务契约更适合显式类型。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> Map 会丢失稳定结构的类型信息；JSON 属于传输表示。当前简单案例返回 User，后续 REST 层可映射为响应 DTO。这样业务层不依赖具体输出协议。真正落地时还要结合调用契约和运行边界验证。

---

### Q19. record 能直接当 Entity 吗？

**面试官提问**

> record 能直接当 Entity 吗？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：record 很适合不可变数据载体和值对象，但不自动适合所有实体。实体通常有身份和生命周期，某些 ORM 还需要特殊构造器、代理或可变属性。应根据框架约束和业务语义选择，而不是看到“不可变”就全部改 record。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，CreateUserCommand 与 UpdateUserProfileCommand 分开表达不同用例输入，User 表达身份与业务状态，响应 DTO 或 JSON 留给边界层，避免一个万能 Map 贯穿所有层。我还会主动说明适用边界：final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**结合当天项目**

CreateUserCommand 与 UpdateUserProfileCommand 分开表达不同用例输入，User 表达身份与业务状态，响应 DTO 或 JSON 留给边界层，避免一个万能 Map 贯穿所有层。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** CreateUserCommand 与 UpdateUserProfileCommand 分开表达不同用例输入，User 表达身份与业务状态，响应 DTO 或 JSON 留给边界层，避免一个万能 Map 贯穿所有层。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> record 很适合不可变数据载体和值对象，但不自动适合所有实体。实体通常有身份和生命周期，某些 ORM 还需要特殊构造器、代理或可变属性。应根据框架约束和业务语义选择，而不是看到“不可变”就全部改 record。真正落地时还要结合调用契约和运行边界验证。

---

### Q20. 为什么 Create 和 Update 要分成两个 Command？

**面试官提问**

> 为什么 Create 和 Update 要分成两个 Command？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：两个用例允许的字段和语义不同。创建没有 ID，更新必须有 ID；邮箱当前不允许在更新资料时修改。分开后非法组合更难表达，也避免一个“万能 DTO”带着大量可空字段。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，CreateUserCommand 与 UpdateUserProfileCommand 分开表达不同用例输入，User 表达身份与业务状态，响应 DTO 或 JSON 留给边界层，避免一个万能 Map 贯穿所有层。我还会主动说明适用边界：这个结论以 Day2 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

CreateUserCommand 与 UpdateUserProfileCommand 分开表达不同用例输入，User 表达身份与业务状态，响应 DTO 或 JSON 留给边界层，避免一个万能 Map 贯穿所有层。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day2 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** CreateUserCommand 与 UpdateUserProfileCommand 分开表达不同用例输入，User 表达身份与业务状态，响应 DTO 或 JSON 留给边界层，避免一个万能 Map 贯穿所有层。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day2 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 两个用例允许的字段和语义不同。创建没有 ID，更新必须有 ID；邮箱当前不允许在更新资料时修改。分开后非法组合更难表达，也避免一个“万能 DTO”带着大量可空字段。真正落地时还要结合调用契约和运行边界验证。

---

### Q21. Service 里的邮箱唯一检查会不会有并发问题？

**面试官提问**

> Service 里的邮箱唯一检查会不会有并发问题？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：会。先查询再保存不是原子操作。进入数据库后还需要唯一索引、事务和对约束异常的处理。Day2 先表达业务规则；并发一致性由后续数据库课程展开。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，名称格式在输入边界，对象不变量在 User，邮箱唯一性由 Service 协调 Repository；进入数据库后仍需要唯一约束和事务处理竞争条件。我还会主动说明适用边界：这个结论以 Day2 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

名称格式在输入边界，对象不变量在 User，邮箱唯一性由 Service 协调 Repository；进入数据库后仍需要唯一约束和事务处理竞争条件。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day2 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 名称格式在输入边界，对象不变量在 User，邮箱唯一性由 Service 协调 Repository；进入数据库后仍需要唯一约束和事务处理竞争条件。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day2 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 会。先查询再保存不是原子操作。进入数据库后还需要唯一索引、事务和对约束异常的处理。Day2 先表达业务规则；并发一致性由后续数据库课程展开。真正落地时还要结合调用契约和运行边界验证。

---

### Q22. 为什么内存 Repository 可以负责分配 ID？

**面试官提问**

> 为什么内存 Repository 可以负责分配 ID？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：ID 分配与具体持久化方式相关：内存实现用自增 long，数据库可能用自增列或序列，分布式系统可能用 UUID。把它放在实现内部可以隐藏技术策略。领域对象通过 `withId()` 接收保存后身份。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，内存 Repository 隐藏 LinkedHashMap、ID 分配和快照细节，Service 只依赖 save、findById 等应用需要的能力；以后换数据库时调用方契约不随存储结构变化。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

内存 Repository 隐藏 LinkedHashMap、ID 分配和快照细节，Service 只依赖 save、findById 等应用需要的能力；以后换数据库时调用方契约不随存储结构变化。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 内存 Repository 隐藏 LinkedHashMap、ID 分配和快照细节，Service 只依赖 save、findById 等应用需要的能力；以后换数据库时调用方契约不随存储结构变化。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> ID 分配与具体持久化方式相关：内存实现用自增 long，数据库可能用自增列或序列，分布式系统可能用 UUID。把它放在实现内部可以隐藏技术策略。领域对象通过 `withId()` 接收保存后身份。真正落地时还要结合调用契约和运行边界验证。

---

### Q23. 返回 `List.copyOf(users.values())` 有什么意义？

**面试官提问**

> 返回 `List.copyOf(users.values())` 有什么意义？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：它创建不可修改的列表快照，调用方不能通过返回列表删除或添加 Repository 内部数据。列表里的 User 本身在本案例也是不可变风格，因此边界更清晰。它不等于数据库事务快照，也不保证并发安全。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。我还会主动说明适用边界：final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**结合当天项目**

Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day2 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** Day2 的 User 在构造器中建立有效状态，通过 updateProfile 返回新对象，不提供任意 setter；这样校验、更新语义和对象不变量集中在领域对象中。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day2 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 它创建不可修改的列表快照，调用方不能通过返回列表删除或添加 Repository 内部数据。列表里的 User 本身在本案例也是不可变风格，因此边界更清晰。它不等于数据库事务快照，也不保证并发安全。真正落地时还要结合调用契约和运行边界验证。

---

### Q24. 分层越多越好吗？

**面试官提问**

> 分层越多越好吗？

**候选人回答（可直接口述）**

我认为不是。分层的价值是隔离职责和变化，让依赖方向更清楚，而不是让目录看起来更“架构化”。每增加一层都会增加接口、对象映射、调用跳转和排查成本，因此这一层必须能回答两个问题：它负责什么独立职责，以及它隔离了哪类可能变化。

在 Day2 用户系统中，领域对象负责自身不变量，Service 编排用例，Repository 抽象存取能力，基础设施提供内存实现，这几层都有明确理由。如果再加一个只把参数原样转发的 Manager 或 Facade，却没有权限、事务、协议适配等职责，我不会为了形式继续拆层。

**结合当天项目**

App 集中组装对象，UserService 处理邮箱唯一等跨对象规则，UserRepository 隐藏存储，User 保护状态。调用链虽多于一个 UserManager，但每一步都能解释；没有语义的同名接口和转发层不加入。

**原理与边界**

大型系统可能需要适配层、事务边界和多个模块，小型练习则应保持最小可解释结构。层数没有统一正确答案，判断依据是职责、依赖和变化成本。

**常见错误回答**

> “企业项目层数越多越专业，每个类都应该有接口、实现类和 Manager。”

这会制造样板代码和调试跳转，却没有真正降低耦合。

**继续追问**

1. **追问：怎样识别无意义的层？**
   **参考回答：** 如果一层长期只有原样转发、没有独立规则、边界转换或变化原因，而且删除后依赖方向仍清楚，它很可能只是形式层。
2. **追问：Repository 接口是否也是多余的一层？**
   **参考回答：** 本项目确实需要隔离内存实现并为后续数据库实现保留稳定存取契约，所以它有清楚的变化边界；但不能因此推导所有类都必须抽接口。
3. **追问：何时应该新增一层？**
   **参考回答：** 当出现独立的协议转换、权限、事务、外部系统适配或模块边界，并且这些职责会独立变化时，再新增对应层并用测试保护契约。

**一句话收尾**

> 好的分层让职责和变化更清楚；没有职责的分层只会增加成本。

---

## 9. 练习题

先独立完成，再查看第 10 节答案。

### 9.1 输出预测

#### 题 1：动态分派

```java
interface Sender {
    String send();
}

class EmailSender implements Sender {
    @Override
    public String send() {
        return "email";
    }
}

Sender sender = new EmailSender();
System.out.println(sender.send());
```

输出什么？方法选择依据变量类型还是运行时对象？

#### 题 2：final 引用

```java
final List<String> names = new ArrayList<>();
names.add("Alice");
System.out.println(names.size());
```

能否编译？输出什么？为什么 final 没有阻止 add？

#### 题 3：返回新对象

```java
User before = User.create(
        "Alice",
        "alice@example.com",
        Set.of("Java")
);
User after = before.updateProfile("Alice Chen", Set.of("Java", "Spring"));

System.out.println(before.getName());
System.out.println(after.getName());
```

两行分别输出什么？

### 9.2 编译错误判断

#### 题 4：降低接口方法可见性

```java
interface Job {
    void run();
}

class ImportJob implements Job {
    void run() {
        System.out.println("run");
    }
}
```

这段代码能否编译？为什么？

#### 题 5：两个父类

```java
class A { }
class B { }
class C extends A, B { }
```

这段代码能否编译？Java 应如何组合多个能力？

#### 题 6：只拥有同名方法

```java
interface Printer {
    void print();
}

class ConsoleTool {
    public void print() { }
}

Printer printer = new ConsoleTool();
```

为什么 TypeScript 中类似对象可能结构兼容，而这段 Java 不能编译？

### 9.3 设计归属

#### 题 7：下面规则分别放在哪里？

将规则分配到 `User`、`UserService`、`UserRepository` 实现或未来 Controller：

1. HTTP 请求缺少 `name` 字段；
2. User 的 name 不能是空白；
3. 系统中邮箱不能重复；
4. 使用 SQL 查询邮箱是否存在；
5. 请求体不是合法 JSON；
6. 数据库邮箱列建立唯一索引。

#### 题 8：识别代码异味

```java
public final class UserService {
    private final LinkedHashMap<Long, User> users = new LinkedHashMap<>();

    public String createAndReturnJson(String name, String email) {
        // 校验、生成 ID、保存、手拼 JSON、打印日志全部在这里
        return "{...}";
    }
}
```

至少指出四个耦合点，并说明重构方向。

### 9.4 接口设计

#### 题 9：哪些方法应该进入 UserRepository？

候选方法：

```text
save(User)
findById(Long)
findAll()
deleteById(Long)
getInternalMap()
printAllUsers()
toJson()
connectToMySql()
```

选择并说明原因。

#### 题 10：是否需要抽接口？

分别判断：

1. 数据库用户仓储；
2. 只有一个 `StringUtils`，包含两个纯函数；
3. 大模型调用客户端，未来可能切换供应商；
4. `CreateUserCommand` record；
5. 邮件、短信两种通知方式。

### 9.5 代码改造

#### 题 11：消除内部依赖创建

改造下面代码，使调用方可以选择 Repository 实现：

```java
public final class UserService {
    private final InMemoryUserRepository repository;

    public UserService() {
        this.repository = new InMemoryUserRepository();
    }
}
```

#### 题 12：保护集合边界

下面代码有什么问题？至少给出两种修复方式。

```java
public final class User {
    private final Set<String> skills;

    public User(Set<String> skills) {
        this.skills = skills;
    }

    public Set<String> getSkills() {
        return skills;
    }
}
```

---

## 10. 练习答案

### 10.1 输出预测答案

#### 题 1

输出：

```text
email
```

变量编译期类型是 `Sender`，运行时对象是 `EmailSender`。实例重写方法通过运行时对象动态分派，因此执行 `EmailSender.send()`。

#### 题 2

可以编译，输出：

```text
1
```

`final` 阻止 `names` 引用重新指向另一个 List，不阻止当前 List 内部内容变化。

#### 题 3

输出：

```text
Alice
Alice Chen
```

`updateProfile()` 返回新 User，没有修改原对象。

### 10.2 编译错误答案

#### 题 4

不能编译。接口抽象方法隐式为 public，实现方法不能降低访问权限。应写：

```java
@Override
public void run() {
    System.out.println("run");
}
```

#### 题 5

不能编译。Java 类只能直接继承一个类。多个能力通常通过实现多个接口并使用组合获得：

```java
class C extends A implements Runnable, AutoCloseable {
    // 实现接口方法
}
```

这只是语法示意，实际接口必须符合真实职责。

#### 题 6

不能编译。Java 是名义类型系统，`ConsoleTool` 没有声明 `implements Printer`。应显式建立类型关系：

```java
class ConsoleTool implements Printer {
    @Override
    public void print() { }
}
```

### 10.3 设计归属答案

#### 题 7

1. HTTP 缺少字段：Controller / 请求 DTO 边界校验；
2. User 名称不能空白：User 自身不变量；
3. 系统邮箱唯一：UserService 编排业务规则；
4. SQL 存在性查询：Repository 数据库实现；
5. 非法 JSON：HTTP / 序列化边界；
6. 唯一索引：数据库持久化约束。

第 3 和第 6 不是互相替代：前者表达业务意图并提供友好错误，后者负责并发条件下的最终约束。

#### 题 8

至少包括：

- Service 直接依赖 `LinkedHashMap`；
- Service 负责 ID 生成；
- 业务层手拼 JSON；
- 保存、校验、输出和日志混合；
- 方法返回传输格式而不是明确业务结果；
- 无法替换存储或交付方式。

重构方向：使用 User 类型、Repository 接口及实现、Service 业务编排，并由边界层负责 JSON 映射。

### 10.4 接口设计答案

#### 题 9

适合进入当前 Repository 的方法：

- `save(User)`；
- `findById(Long)`；
- `findAll()`；
- `deleteById(Long)`。

不应进入：

- `getInternalMap()`：泄露实现结构；
- `printAllUsers()`：属于展示；
- `toJson()`：属于传输映射；
- `connectToMySql()`：绑定具体技术，内存实现无法合理遵守。

#### 题 10

1. 数据库仓储：适合，属于明确外部边界；
2. 简单纯函数工具：通常不需要接口；
3. 模型客户端：适合，供应商和调用实现可能替换；
4. Command record：不需要，它是明确数据载体；
5. 多种通知：适合使用通知接口表达共同能力。

### 10.5 代码改造答案

#### 题 11

```java
public final class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = Objects.requireNonNull(repository);
    }
}
```

组合根负责创建：

```java
UserRepository repository = new InMemoryUserRepository();
UserService service = new UserService(repository);
```

#### 题 12

问题：构造器保存调用方可变集合引用，getter 又直接暴露内部引用。调用方可以从两个方向改变对象状态。

修复方式一，创建不可修改快照：

```java
this.skills = Collections.unmodifiableSet(new LinkedHashSet<>(skills));

public Set<String> getSkills() {
    return skills;
}
```

修复方式二，每次返回副本：

```java
this.skills = new LinkedHashSet<>(skills);

public Set<String> getSkills() {
    return new LinkedHashSet<>(skills);
}
```

方式一通常更适合本案例；方式二每次读取都复制，成本和语义不同。

---

## 11. 一页检查清单

### 对象与封装

- [ ] 我能从状态、行为和不变量解释对象。
- [ ] 我知道封装不等于生成所有 setter。
- [ ] 我能解释构造器和静态工厂各自的作用。
- [ ] 我知道 `final` 引用不等于对象深度不可变。
- [ ] 我能说明防御性复制保护了哪两个方向。
- [ ] 我能解释返回新对象更新的优点和代价。

### 访问控制与包

- [ ] 我能区分 public、protected、package-private、private。
- [ ] 我知道 `protected` 还包含同包访问，不能简单理解为“子类专用”。
- [ ] 我知道包既是命名空间，也是访问和依赖组织边界。
- [ ] 我不会把所有实现类都无理由声明为 public。

### 接口与多态

- [ ] 我知道接口可以有 default、static 和 private 方法。
- [ ] 我能比较 Java interface 与 TypeScript interface。
- [ ] 我能根据状态和身份关系选择接口或抽象类。
- [ ] 我知道组合优先不等于永远禁止继承。
- [ ] 我能区分重写与重载。
- [ ] 我能解释编译期类型与运行时对象。
- [ ] 我知道 static 方法不参与实例动态分派。
- [ ] 我不会机械地为每个类创建同名接口。

### 分层与依赖

- [ ] 我能说清 App、Service、User、Repository 各自职责。
- [ ] 我知道 Repository 不是 Map 的同义词。
- [ ] 我能区分 DI 和 DIP。
- [ ] 我能手写构造器注入，不依赖 Spring。
- [ ] 我知道对象组装应该集中在组合根。
- [ ] 我能解释为什么高层业务不应依赖低层技术细节。
- [ ] 我能按规则性质分配边界、领域、业务和持久化校验。

---

## 12. 代码评审清单

看到一段业务代码时，按下面顺序检查。

### 12.1 对象是否有效

- 构造完成后是否可能处于无效状态？
- 集合和可变对象是否做了防御性复制？
- getter 是否泄露可变内部结构？
- public setter 是否允许绕过业务行为？
- `equals()` / `hashCode()` 是否使用稳定身份？

### 12.2 职责是否集中

- 一个类是否同时处理输入、业务、存储和输出？
- 业务对象是否只是一堆 getter/setter，规则全散落在 Service？
- Service 是否出现 SQL、HTTP、JSON 或具体集合细节？
- Repository 是否承担了“是否允许”的业务决策？

### 12.3 依赖是否合理

- 高层类构造器参数是接口还是易变化的具体实现？
- 业务类内部是否随意 `new` 数据库、HTTP 或模型客户端？
- 是否为了测试或替换而频繁向下转型？
- 接口是否由调用方需要塑造，还是完整复制实现类？
- 新增一种实现是否必须修改所有调用方？

### 12.4 分层是否只是形式

- 每层是否有独立职责和变化原因？
- 是否存在只转发参数、没有任何语义的空层？
- DTO 与 Entity 是否因为“省映射”而完全混用？
- 包依赖是否从高层反向指向具体基础设施？
- 文件数量增加后，理解成本是否真的降低？

---

## 13. 术语表

| 术语 | 简明解释 |
|---|---|
| State | 对象当前保存的数据状态 |
| Behavior | 对象允许执行的动作 |
| Invariant | 对象在有效生命周期中始终应满足的条件 |
| Encapsulation | 隐藏表示细节并保护对象契约与不变量 |
| Defensive Copy | 复制可变输入或输出，避免外部修改内部状态 |
| Immutable | 创建后可观察状态不再变化 |
| Interface | 类型能力或协作契约 |
| Abstract Class | 可保存共享状态和部分实现的不可直接实例化基类 |
| Composition | 一个对象持有并使用另一个对象 |
| Inheritance | 子类继承父类，表达受控的 is-a 关系 |
| Polymorphism | 调用方通过共同契约使用不同实现 |
| Dynamic Dispatch | 运行时根据实际对象选择重写实例方法 |
| DI | 从外部把依赖对象提供给使用者 |
| DIP | 高层与低层都依赖稳定抽象的设计原则 |
| Composition Root | 应用集中创建和连接对象的入口 |
| Repository | 隔离业务对象存取方式的契约 |
| Entity | 具有身份和生命周期的业务对象 |
| DTO | 跨边界传递数据的明确结构 |
| Command | 表达某个用例输入和意图的数据对象 |
| Port | 高层应用声明的外部能力接口 |
| Infrastructure | 数据库、文件、HTTP 等技术实现层 |

---

## 14. 下一步：Day3 集合与泛型实践

Day3 不再只介绍集合名称，而是在当前分层案例上加入：

1. 分页模型与泛型返回类型；
2. 按名称和技能筛选；
3. 排序与稳定顺序；
4. 技能倒排索引；
5. 去重与 `equals()` / `hashCode()` 的实际影响；
6. 集合快照、不可变返回值和边界；
7. 复杂度与数据量增长后的选型。

在进入 Day3 前，至少应能不看答案画出：

```text
App → UserService → UserRepository ← InMemoryUserRepository
```

并能解释每一个箭头表示的是创建、调用、依赖还是实现关系。

---

## 15. 官方参考资料

- [Dev.java：Objects, Classes, Interfaces, Packages, and Inheritance](https://dev.java/learn/oop/)
- [Java Language Specification 21：Classes](https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html)
- [Java Language Specification 21：Interfaces](https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html)
- [Java Language Specification 21：Access Control](https://docs.oracle.com/javase/specs/jls/se21/html/jls-6.html#jls-6.6)
- [Java Language Specification 21：Packages and Modules](https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html)
- [Java SE 21 API：Optional](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html)
- [Maven：Standard Directory Layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html)
- [Maven：Introduction to the POM](https://maven.apache.org/guides/introduction/introduction-to-the-pom.html)

阅读建议：

- 初学时先读 Dev.java 建立直觉；
- 遇到“语言到底保证什么”的争议，再查 JLS；
- 遇到具体类和方法行为，优先查 Java SE API；
- 不需要从头通读 JLS，也不要用一篇博客替代规范。

---

# 附录 A：完整可运行代码

## A.1 工程目录

```text
day2-user-management/
├── pom.xml
└── src/main/java/com/example/day2/
    ├── bootstrap/App.java
    ├── application/UserService.java
    ├── application/command/CreateUserCommand.java
    ├── application/command/UpdateUserProfileCommand.java
    ├── application/port/UserRepository.java
    ├── domain/User.java
    └── infrastructure/InMemoryUserRepository.java
```

## A.2 `pom.xml`

<!-- file: pom.xml -->
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>day2-user-management</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.release>21</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.13.0</version>
                <configuration>
                    <release>21</release>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

## A.3 `CreateUserCommand.java`

<!-- file: src/main/java/com/example/day2/application/command/CreateUserCommand.java -->
```java
package com.example.day2.application.command;

import java.util.List;

public record CreateUserCommand(
        String name,
        String email,
        List<String> skills
) {
}
```

Command 只短暂表达输入，不在本案例中长期保存。Service 会处理 null List、空技能和重复技能。

## A.4 `UpdateUserProfileCommand.java`

<!-- file: src/main/java/com/example/day2/application/command/UpdateUserProfileCommand.java -->
```java
package com.example.day2.application.command;

import java.util.List;

public record UpdateUserProfileCommand(
        Long id,
        String name,
        List<String> skills
) {
}
```

更新命令不包含 email，明确当前用例不允许修改邮箱。以后增加修改邮箱用例时，应单独处理唯一性和验证流程。

## A.5 `User.java`

<!-- file: src/main/java/com/example/day2/domain/User.java -->
```java
package com.example.day2.domain;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

public final class User {
    private final Long id;
    private final String name;
    private final String email;
    private final Set<String> skills;

    private User(Long id, String name, String email, Set<String> skills) {
        if (id != null && id <= 0) {
            throw new IllegalArgumentException("id 必须为正整数");
        }
        this.id = id;
        this.name = requireText(name, "name");
        this.email = requireEmail(email);
        this.skills = immutableSkills(skills);
    }

    public static User create(String name, String email, Set<String> skills) {
        return new User(null, name, email, skills);
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Set<String> getSkills() {
        return skills;
    }

    public User withId(Long newId) {
        if (id != null) {
            throw new IllegalStateException("已有 ID 的用户不能重新分配 ID");
        }
        return new User(newId, name, email, skills);
    }

    public User updateProfile(String newName, Set<String> newSkills) {
        return new User(id, newName, email, newSkills);
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " 不能为空");
        }
        return value.trim();
    }

    private static String requireEmail(String value) {
        String email = requireText(value, "email");
        int at = email.indexOf('@');
        if (at <= 0 || at == email.length() - 1) {
            throw new IllegalArgumentException("email 格式不正确: " + value);
        }
        return email;
    }

    private static Set<String> immutableSkills(Set<String> source) {
        if (source == null || source.isEmpty()) {
            return Set.of();
        }

        LinkedHashSet<String> copy = new LinkedHashSet<>();
        for (String skill : source) {
            copy.add(requireText(skill, "skill"));
        }
        return Collections.unmodifiableSet(copy);
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof User user)) {
            return false;
        }
        return id != null && Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return id == null ? System.identityHashCode(this) : Objects.hash(id);
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", skills=" + skills +
                '}';
    }
}
```

相等策略沿用 Day1：已经分配 ID 的用户按 ID 相等；尚未保存的用户只和自身相等。真实项目必须根据稳定业务身份设计，不能机械复制。

## A.6 `UserRepository.java`

<!-- file: src/main/java/com/example/day2/application/port/UserRepository.java -->
```java
package com.example.day2.application.port;

import com.example.day2.domain.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository {
    User save(User user);

    Optional<User> findById(Long id);

    List<User> findAll();

    boolean existsByEmail(String email, Long excludedUserId);

    boolean deleteById(Long id);
}
```

## A.7 `InMemoryUserRepository.java`

<!-- file: src/main/java/com/example/day2/infrastructure/InMemoryUserRepository.java -->
```java
package com.example.day2.infrastructure;

import com.example.day2.application.port.UserRepository;
import com.example.day2.domain.User;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

public final class InMemoryUserRepository implements UserRepository {
    private final Map<Long, User> users = new LinkedHashMap<>();
    private long nextId = 1L;

    @Override
    public User save(User user) {
        Objects.requireNonNull(user, "user 不能为空");

        User saved = user;
        if (user.getId() == null) {
            saved = user.withId(nextId++);
        } else if (user.getId() >= nextId) {
            nextId = user.getId() + 1;
        }

        users.put(saved.getId(), saved);
        return saved;
    }

    @Override
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(users.get(id));
    }

    @Override
    public List<User> findAll() {
        return List.copyOf(users.values());
    }

    @Override
    public boolean existsByEmail(String email, Long excludedUserId) {
        for (User user : users.values()) {
            boolean sameEmail = user.getEmail().equalsIgnoreCase(email);
            boolean excluded = Objects.equals(user.getId(), excludedUserId);
            if (sameEmail && !excluded) {
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean deleteById(Long id) {
        return users.remove(id) != null;
    }
}
```

这里刻意使用普通循环而非 Stream，因为 Stream 是 Day5 主题。当前重点是接口实现与职责边界。

## A.8 `UserService.java`

<!-- file: src/main/java/com/example/day2/application/UserService.java -->
```java
package com.example.day2.application;

import com.example.day2.application.command.CreateUserCommand;
import com.example.day2.application.command.UpdateUserProfileCommand;
import com.example.day2.application.port.UserRepository;
import com.example.day2.domain.User;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;

public final class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = Objects.requireNonNull(repository, "repository 不能为空");
    }

    public User create(CreateUserCommand command) {
        Objects.requireNonNull(command, "command 不能为空");

        String name = normalizeText(command.name(), "name");
        String email = normalizeEmail(command.email());
        Set<String> skills = normalizeSkills(command.skills());

        if (repository.existsByEmail(email, null)) {
            throw new IllegalArgumentException("邮箱已存在: " + email);
        }

        return repository.save(User.create(name, email, skills));
    }

    public User findById(Long id) {
        requirePositiveId(id);
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("用户不存在: " + id));
    }

    public User updateProfile(UpdateUserProfileCommand command) {
        Objects.requireNonNull(command, "command 不能为空");

        User existing = findById(command.id());
        User updated = existing.updateProfile(
                normalizeText(command.name(), "name"),
                normalizeSkills(command.skills())
        );
        return repository.save(updated);
    }

    public boolean delete(Long id) {
        requirePositiveId(id);
        return repository.deleteById(id);
    }

    public List<User> listAll() {
        return repository.findAll();
    }

    private static void requirePositiveId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("id 必须为正整数");
        }
    }

    private static String normalizeText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " 不能为空");
        }
        return value.trim();
    }

    private static String normalizeEmail(String value) {
        return normalizeText(value, "email").toLowerCase(Locale.ROOT);
    }

    private static Set<String> normalizeSkills(List<String> skills) {
        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        if (skills == null) {
            return normalized;
        }

        for (String skill : skills) {
            if (skill != null && !skill.isBlank()) {
                normalized.add(skill.trim());
            }
        }
        return normalized;
    }
}
```

Service 负责输入标准化和跨对象唯一性规则，User 构造时仍会保护自身不变量。这是不同层对各自契约负责，不是随意复制规则。

## A.9 `App.java`

<!-- file: src/main/java/com/example/day2/bootstrap/App.java -->
```java
package com.example.day2.bootstrap;

import com.example.day2.application.UserService;
import com.example.day2.application.command.CreateUserCommand;
import com.example.day2.application.command.UpdateUserProfileCommand;
import com.example.day2.application.port.UserRepository;
import com.example.day2.domain.User;
import com.example.day2.infrastructure.InMemoryUserRepository;

import java.util.List;

public final class App {
    private App() {
    }

    public static void main(String[] args) {
        UserRepository repository = new InMemoryUserRepository();
        UserService service = new UserService(repository);

        User alice = service.create(new CreateUserCommand(
                " Alice ",
                "ALICE@example.com",
                List.of("Java", "TypeScript", "Java", " ")
        ));
        User bob = service.create(new CreateUserCommand(
                "Bob",
                "bob@example.com",
                List.of("Vue", "Java")
        ));

        System.out.println("创建后:");
        service.listAll().forEach(System.out::println);

        System.out.println("\n按 ID 查询: " + service.findById(alice.getId()).getName());

        User updatedAlice = service.updateProfile(new UpdateUserProfileCommand(
                alice.getId(),
                "Alice Chen",
                List.of("Java", "Spring", "Spring")
        ));
        System.out.println("更新后: " + updatedAlice);

        System.out.println("删除 Bob: " + service.delete(bob.getId()));
        System.out.println("剩余用户数: " + service.listAll().size());

        try {
            service.create(new CreateUserCommand(
                    "Another Alice",
                    "alice@example.com",
                    List.of("Agent")
            ));
        } catch (IllegalArgumentException exception) {
            System.out.println("重复邮箱校验: " + exception.getMessage());
        }
    }
}
```

## A.10 使用 Maven 编译运行

在 `day2-user-management` 根目录执行：

```bash
mvn clean compile
java -cp target/classes com.example.day2.bootstrap.App
```

也可以在 IntelliJ IDEA 中直接运行 `App.main()`。

如果暂时没有 Maven，只使用 JDK 21 也能验证：

```bash
mkdir -p out
javac --release 21 -encoding UTF-8 \
  -d out \
  $(find src/main/java -name '*.java')

java -cp out com.example.day2.bootstrap.App
```

### 预期输出

```text
创建后:
User{id=1, name='Alice', email='alice@example.com', skills=[Java, TypeScript]}
User{id=2, name='Bob', email='bob@example.com', skills=[Vue, Java]}

按 ID 查询: Alice
更新后: User{id=1, name='Alice Chen', email='alice@example.com', skills=[Java, Spring]}
删除 Bob: true
剩余用户数: 1
重复邮箱校验: 邮箱已存在: alice@example.com
```

---

# 附录 B：现场演示脚本

## B.1 10 分钟精简演示

1. 打开反例 `UserManager`，让听众找出职责。
2. 展示 `UserRepository`，只读方法签名，不看实现。
3. 展示 `UserService` 字段类型，确认没有 Map。
4. 展示 `InMemoryUserRepository`，指出 Map 被限制在基础设施层。
5. 在 `App` 中完成手工构造器注入。
6. 运行程序，验证创建、更新、删除和重复邮箱。
7. 口头把内存实现替换成假想 `JdbcUserRepository`，说明哪些文件应当不变。

## B.2 30 分钟现场编码

1. 从只有 `UserManager` 的分支开始。
2. 提取 `User` 并让编译器暴露所有 Map 访问点。
3. 提取 Repository 接口。
4. 让原 Map 代码迁移到 `InMemoryUserRepository`。
5. 通过构造器把 Repository 注入 Service。
6. 将参数列表改为 Command record。
7. 运行一次成功流程和一次失败流程。

## B.3 演示中故意制造的错误

可以选择一个，不要一次制造太多：

- 把 `UserRepository` 实现方法的 public 删除，观察编译错误；
- 在 Service 内重新 `new InMemoryUserRepository()`，让听众指出依赖泄漏；
- 直接返回 Repository 内部可变 List，现场从外部 clear；
- 把 email 唯一规则塞进 Repository，让听众判断“查询”和“决策”的区别；
- 把 `UserService` 改为继承 Repository，讨论为什么关系不成立。

---

# 附录 C：常见错误排查

## C.1 `class ... is public, should be declared in a file named ...`

public 顶级类名与文件名不一致。确认 `UserService` 位于 `UserService.java`。

## C.2 `package ... does not exist`

常见原因：

- 文件目录与 package 声明不一致；
- 只编译了单个文件，没有编译依赖源码；
- 在错误目录执行 javac；
- import 包名拼写错误。

从项目根目录统一编译全部源码。

## C.3 `attempting to assign weaker access privileges; was public`

实现接口方法时省略了 public。接口抽象方法是 public，实现不能降低可见性。

## C.4 `UserRepository is abstract; cannot be instantiated`

接口不能直接 `new`：

```java
// 错误
new UserRepository();

// 正确
new InMemoryUserRepository();
```

变量可以使用接口类型，创建对象时必须选择具体实现。

## C.5 `NullPointerException` 出现在构造器注入

检查组合根是否传入 null。本案例用 `Objects.requireNonNull` 在构造时快速失败，使错误更靠近来源。

## C.6 更新后原对象为什么没变

`updateProfile()` 返回新对象。必须使用返回值：

```java
User updated = user.updateProfile("New Name", skills);
```

如果忽略返回值，原对象按设计保持不变。

## C.7 修改输入 Set 后 User 为什么没变化

这是防御性复制的预期结果。User 构造时复制集合，并保存不可修改视图。

## C.8 Maven 使用的不是 JDK 21

检查：

```bash
java -version
javac -version
mvn -version
```

`mvn -version` 会显示 Maven 实际使用的 Java。三者应指向预期的 JDK 21 环境。

---

# 附录 D：分享者答疑策略

面对设计问题，不要只背“最佳实践”。建议按四步回答：

1. **先给当前结论**：本案例选择什么。
2. **说明驱动因素**：哪种变化、规则或依赖导致这个选择。
3. **给出边界与反例**：什么情况下不需要这样做。
4. **回到可运行代码**：指出选择具体落在哪个类和方法。

示例：

> 问：是不是所有 Repository 都必须有接口？
> 答：不是。本案例有接口，因为存储是明确的可替换边界，下一阶段会从内存切换数据库。一个完全内部、没有替换和隔离价值的小组件，不必为了形式抽接口。这里的实际收益是 `UserService` 不出现 Map、SQL 或数据库类。

遇到超出 Day2 边界的问题，可以明确延后：

> Spring 如何扫描 Bean、数据库事务如何保证唯一、并发请求怎样处理竞态、JUnit 如何替换 Repository，都会在后续专题展开。今天先确保我们能用纯 Java 画清对象和源码依赖方向。

---

## 最后总结

今天最重要的不是记住四个包名，而是形成下面的判断顺序：

1. 这个对象必须始终满足什么？
2. 这个类因为什么原因变化？
3. 调用方真正需要什么能力？
4. 哪些技术细节可能替换？
5. 源码依赖是否从高层业务指向低层实现？
6. 新增实现时，能否少改调用方？

最终主线可以压缩成一句话：

> 用对象保护有效状态，用接口表达协作契约，用组合连接实现，用清晰的依赖方向隔离变化。
