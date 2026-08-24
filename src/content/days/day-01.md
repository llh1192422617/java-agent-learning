---
day: 1
title: Java 核心速通——从前端思维到可运行的后端代码
date: '2026-08-24'
summary: 掌握 Java 运行链路、语言基础、面向对象、集合与泛型，并完成内存版用户管理案例。
tags:
  - Java
  - JVM
  - 面向对象
  - 集合
  - 泛型
status: completed
duration: 60–90 分钟
---
> **文档定位**：60–90 分钟分享讲义 + 会后自学手册 + 现场答疑参考  
> **目标受众**：熟悉 JavaScript / TypeScript，准备转向 Java 全栈与 Agent 应用开发的前端工程师  
> **基准环境**：macOS、JDK 21、IntelliJ IDEA、Maven  
> **学习边界**：今天建立 Java 语言和工程地基，不展开 Spring、数据库、并发、JVM 调优和模型训练

---

## 0. 如何使用这份讲义

正文使用三种提示：

- **必须讲清**：分享结束后，听众应该能够独立复述。
- **现场演示**：建议打开终端或 IntelliJ IDEA 实际运行。
- **容易被问**：分享现场经常出现的追问，答案在正文或 FAQ 中。

### 0.1 今天的学习目标

学完后，你应该能够：

1. 讲清 JDK、JRE、JVM、字节码以及 Java 程序的运行链路。
2. 在命令行和 IntelliJ IDEA 中编译、运行、调试 Java 程序。
3. 理解 Java 与 JavaScript / TypeScript 在类型、模块、类和运行时上的关键差异。
4. 正确使用基本类型、包装类、`String`、方法、类、接口和多态。
5. 根据业务语义选择 `List`、`Set`、`Map` 及常见实现。
6. 解释泛型、装箱拆箱、`equals()` / `hashCode()` 和集合复杂度的常见陷阱。
7. 看懂并运行一个分层的内存版用户管理系统。

### 0.2 建议分享时间

| 时间 | 内容 | 目标 |
|---|---|---|
| 0–10 分钟 | Java 运行链路与工程结构 | 知道代码如何被编译和运行 |
| 10–30 分钟 | 类型、字符串、方法与控制流 | 建立 Java 语法心智模型 |
| 30–48 分钟 | 类、接口、组合与多态 | 理解业务代码如何分层 |
| 48–68 分钟 | 泛型与集合 | 能根据场景选集合并解释原因 |
| 68–82 分钟 | 用户管理案例 | 串起前面的知识点 |
| 82–90 分钟 | 总结与答疑 | 用 FAQ 检查理解深度 |

### 0.3 一句话主线

> Java 的价值不在于“语法比 JavaScript 多”，而在于它通过编译期类型、明确契约和成熟工具链，让大型业务代码更容易维护、重构和验证。

### 0.4 内容导航

- [1. Java 程序怎么运行](#1-java-程序到底是怎么运行的)
- [2. 从 JS / TS 迁移到 Java](#2-从-js--ts-迁移到-java-的语言基础)
- [3. 面向对象与接口](#3-面向对象让业务代码拥有明确边界)
- [4. 泛型与集合框架](#4-泛型与集合框架)
- [5. 内存版用户管理系统](#5-完整案例内存版用户管理系统)
- [6. 高频问题](#6-分享时必须能回答的高频问题)
- [7. 练习题](#7-练习题)
- [9. 检查清单](#9-一页检查清单)
- [附录 A：完整代码](#附录-a完整可运行代码)

---

## 1. Java 程序到底是怎么运行的

### 1.1 JVM、JRE、JDK

```text
.java 源码
   │ javac 编译
   ▼
.class 字节码
   │ java 启动 JVM
   ▼
类加载 → 字节码验证 → 解释执行 / JIT 编译 → 机器指令
```

| 名称 | 全称 | 负责什么 |
|---|---|---|
| JVM | Java Virtual Machine | 加载并运行 Java 字节码 |
| JRE | Java Runtime Environment | JVM 加上运行 Java 程序所需的类库和组件 |
| JDK | Java Development Kit | JRE 加上 `javac`、`jar`、`javadoc` 等开发工具 |

现代开发直接安装 JDK。JDK 21 包含开发、编译和运行所需能力，无需再单独寻找 JRE 安装包。

**有限类比：**

- `.java` 类似 `.ts` 源码。
- `javac` 可以类比 `tsc`，但 Java 编译结果是 JVM 字节码。
- JVM 可以类比 JavaScript 运行时中的引擎，但两者的语言模型、类加载和运行机制并不相同。

> **必须讲清**：Java 既不是“只编译”也不是“只解释”。源码先编译为字节码；运行时 JVM 可以解释代码，也可以通过 JIT 将热点代码编译为机器码。

### 1.2 “一次编写，到处运行”是什么意思

Java 编译器生成面向 JVM 规范的字节码，而不同操作系统提供各自的 JVM 实现。因此同一份符合规范的 `.class` / `.jar` 通常可以跨平台运行。

这不代表任何程序都天然跨平台。文件路径、权限、本地动态库、字符编码、时区和操作系统命令仍可能引入平台差异。

### 1.3 检查开发环境

```bash
/usr/libexec/java_home -v 21
java -version
javac -version
```

期望 `java` 和 `javac` 都指向 JDK 21。使用 zsh 时，可在 `~/.zshrc` 中配置：

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
export PATH="$JAVA_HOME/bin:$PATH"
```

### 1.4 第一个程序

文件 `HelloWorld.java`：

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, Java 21!");
    }
}
```

```bash
javac HelloWorld.java
java HelloWorld
```

`java` 后面接的是类名，不是 `HelloWorld.class` 文件名。

#### `public static void main(String[] args)` 怎么读

| 片段 | 含义 |
|---|---|
| `public` | Java 启动器可以访问它 |
| `static` | 不创建 `HelloWorld` 对象也能调用 |
| `void` | 不向调用者返回值 |
| `main` | Java 启动器约定的入口方法名 |
| `String[] args` | 接收命令行参数 |

普通命令行 Java 应用由这个入口启动，但测试框架、Servlet 容器、Spring Boot 和构建插件还有各自的启动与回调机制。

> **现场演示**：故意改错类名、删除分号、把 `String` 写成 `string`，观察编译错误。

### 1.5 `public class`、`package` 与 classpath

- 一个源文件最多声明一个 `public` 顶级类。
- 如果存在 `public` 顶级类，文件名必须和该类名一致。
- `public class` 与 TypeScript 的 `export class` 只是有限类比，访问控制与模块机制并不相同。
- `package` 是语言级命名空间，也是目录组织约定。
- `import` 让代码使用类型的简单名称，不等于复制源码。
- classpath 是编译器和 JVM 查找类与资源的一组位置。

```java
package com.example.day1;

import java.util.ArrayList;
import java.util.List;

public class App {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
    }
}
```

声明 `package com.example.day1;` 后，文件通常位于：

```text
src/main/java/com/example/day1/App.java
```

> **容易被问**：Java package 和 npm package 一样吗？  
> 不一样。Java `package` 首先是命名空间；npm package 是依赖分发单元，Maven artifact 更接近后者。

### 1.6 Maven 最小工程结构

```text
day1-user-management/
├── pom.xml
└── src/
    ├── main/java/com/example/day1/App.java
    └── test/java/com/example/day1/
```

```bash
mvn compile
mvn test
mvn package
```

`pom.xml` 描述项目坐标、Java 版本、依赖和构建规则。第一天不必背 Maven 生命周期，只需理解它让团队使用一致的目录和命令构建项目。

### 1.7 IntelliJ IDEA 最小操作闭环

1. 选择 **Open** 打开包含 `pom.xml` 的项目根目录。
2. 在 **Project Structure → Project SDK** 中选择 JDK 21。
3. 等待 Maven 导入完成，确认 `src/main/java` 被识别为 Sources。
4. 打开包含 `main` 的类，点击方法左侧绿色运行按钮。
5. 在关键行点击行号设置断点，使用 Debug 运行。
6. 观察 Variables、Call Stack 和 Console，确认数据如何流过方法。

> **现场演示**：在 `UserService.create` 的第一行设置断点，单步观察名称清理、邮箱标准化、重复校验和 Repository 保存。

---

## 2. 从 JS / TS 迁移到 Java 的语言基础

### 2.1 核心差异总览

| 维度 | JavaScript / TypeScript | Java |
|---|---|---|
| 类型检查 | JS 动态；TS 编译期检查后类型擦除 | 编译期检查，类型进入字节码与运行时模型 |
| 运行单位 | 脚本、模块、函数 | 类、接口、枚举、record 等类型 |
| 函数 | 可独立存在，是一等公民 | 方法必须声明在类型中；Lambda 依托函数式接口 |
| 数字 | JS 常用 `number` | 多种整数和浮点类型，范围与精度明确 |
| 真值判断 | 存在 truthy / falsy | 条件表达式必须是 `boolean` |
| 空值 | `undefined`、`null` | 主要是 `null`，仅引用类型可为 `null` |
| 相等 | `===` 比较值/类型语义 | 基本类型 `==` 比值；引用类型 `==` 比引用 |
| 泛型 | TS 泛型主要服务类型检查 | Java 泛型进入编译规则，运行时通常发生类型擦除 |

Java 经常以类和对象组织代码，但**并非万物皆对象**。Java 特意保留了八种基本类型。

### 2.2 八种基本类型

| 类别 | 类型 | 位数 | 常见用途 |
|---|---|---:|---|
| 整数 | `byte` | 8 | 二进制数据、极小范围数值 |
| 整数 | `short` | 16 | 较少直接使用 |
| 整数 | `int` | 32 | 默认整数类型、计数和索引 |
| 整数 | `long` | 64 | ID、时间戳、大范围整数 |
| 浮点 | `float` | 32 | 特定低精度场景，字面量常加 `F` |
| 浮点 | `double` | 64 | 默认浮点类型 |
| 字符 | `char` | 16 | UTF-16 代码单元，不等同于完整 Unicode 字符 |
| 布尔 | `boolean` | 实现相关 | 只能是 `true` 或 `false` |

```java
int count = 10;
long userId = 9_000_000_000L;
double ratio = 0.85;
float progress = 0.5F;
char level = 'A';
boolean enabled = true;
```

金额不要使用 `double` 做精确计算，业务中通常使用 `BigDecimal`，后续专题再讲。

#### 基本类型不等于“一定在栈上”

“基本类型在栈、对象在堆”是过度简化。值放在哪里取决于它是局部变量、字段、数组元素，以及 JVM 的优化策略。第一天应关注值语义、是否允许 `null`、类型范围和 API 契约，不要把实现细节当语言保证。

### 2.3 引用类型、`null` 与默认值

`String`、数组、类实例、接口类型变量、枚举、record 和集合都是引用类型。

```java
String name = null;
User user = null;
// System.out.println(name.length()); // NullPointerException
```

字段和数组元素有默认值：

| 类型 | 默认值 |
|---|---|
| 整数类型 | `0` |
| 浮点类型 | `0.0` |
| `boolean` | `false` |
| `char` | `\u0000` |
| 引用类型 | `null` |

但局部变量没有可直接读取的默认值：

```java
public static void main(String[] args) {
    int count;
    // System.out.println(count); // 编译错误：变量可能尚未初始化
}
```

> **必须讲清**：“`int` 默认是 0”只适用于字段和数组元素，不适用于未初始化的局部变量。

### 2.4 基本类型与包装类

| 基本类型 | 包装类 |
|---|---|
| `byte` | `Byte` |
| `short` | `Short` |
| `int` | `Integer` |
| `long` | `Long` |
| `float` | `Float` |
| `double` | `Double` |
| `char` | `Character` |
| `boolean` | `Boolean` |

包装类用于泛型、可空状态、类型转换工具，以及与框架和反射协作。

```java
Integer boxed = 10; // 自动装箱
int value = boxed;  // 自动拆箱

Integer missing = null;
// int broken = missing; // NullPointerException
```

#### `Integer` 缓存陷阱

```java
Integer a = 100;
Integer b = 100;
System.out.println(a == b);      // true，命中规范要求的缓存范围

Integer x = 1000;
Integer y = 1000;
System.out.println(x == y);      // 通常为 false
System.out.println(x.equals(y)); // true
```

规范保证 `Integer.valueOf` 至少缓存 `-128` 到 `127`。业务代码比较包装类内容时使用 `equals()`，不要依赖缓存范围。

### 2.5 类型转换与溢出

```java
int count = 100;
long total = count; // 扩大转换

long large = 3_000_000_000L;
int overflowed = (int) large; // 缩小转换，可能丢失信息

int max = Integer.MAX_VALUE;
System.out.println(max + 1); // -2147483648
```

整数运算溢出不会默认抛异常。需要检测时可使用 `Math.addExact` 等方法。

### 2.6 `String`：不可变对象

```java
String original = "Java";
String upper = original.toUpperCase();

System.out.println(original); // Java
System.out.println(upper);    // JAVA
```

`String` 不可变便于安全共享、字符串池、哈希缓存和作为 Map Key。大量循环拼接时使用 `StringBuilder`：

```java
StringBuilder builder = new StringBuilder();
for (int i = 1; i <= 3; i++) {
    builder.append(i).append(',');
}
System.out.println(builder); // 1,2,3,
```

### 2.7 `==` 与 `equals()`

```java
String a = new String("Java");
String b = new String("Java");

System.out.println(a == b);      // false：引用不同
System.out.println(a.equals(b)); // true：内容相同
```

- 基本类型的 `==` 比较值。
- 引用类型的 `==` 比较是否指向同一对象。
- `equals()` 表达业务上的“内容相等”，具体语义由类型实现。
- 空值安全比较可使用 `Objects.equals(a, b)`。

> **现场演示**：比较字符串字面量与 `new String(...)`，解释为什么不能根据某一次 `==` 的结果推断字符串内容相等。

### 2.8 项目所需的控制流

Java 没有 JavaScript 的 truthy / falsy：

```java
int count = 1;
// if (count) {} // 编译错误

if (count > 0) {
    System.out.println("有数据");
}

for (User user : users) {
    System.out.println(user.getName());
}

String roleName = switch (role) {
    case "admin" -> "管理员";
    case "user" -> "普通用户";
    default -> "未知角色";
};
```

第一天不必背完 `for`、`while`、`switch` 的所有形式。项目中遇到时再深化。

### 2.9 方法、返回值、重载与 `static`

```java
public static int add(int a, int b) {
    return a + b;
}

public static long add(long a, long b) {
    return a + b;
}
```

这两个 `add` 构成方法重载（overload）：方法名相同，参数列表不同。不能只靠返回类型区分重载。

`static` 方法属于类本身，不依赖某个对象实例。不要为了方便把所有方法都写成 `static`；业务状态和可替换依赖通常由对象协作表达。

### 2.10 Java 始终按值传递

Java 方法参数始终是值传递。传基本类型时复制值；传引用类型时复制“引用值”。

```java
static void rename(User user) {
    user = new User(2L, "Bob", "bob@example.com", Set.of());
}

User user = new User(1L, "Alice", "alice@example.com", Set.of());
rename(user);
System.out.println(user.getName()); // Alice
```

`rename` 改变的是局部引用副本，调用方变量仍指向原对象。如果方法通过引用调用可变对象的 setter，则对象内部状态可能变化；这仍然不代表 Java 变成了引用传递。

> **容易被问**：为什么传入 `List` 后，方法里 `add` 会影响外部？  
> 因为内外两个引用值都指向同一个可变 List 对象。复制的是引用值，不是对象本身。

---

## 3. 面向对象：让业务代码拥有明确边界

### 3.1 类、对象、构造器与封装

```java
public final class User {
    private final Long id;
    private final String name;
    private final String email;

    public User(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public Long getId() {
        return id;
    }
}
```

- 类定义状态和行为，对象是类的实例。
- 构造器建立对象的初始状态。
- `private` 隐藏实现细节。
- `final` 字段只能在声明处或构造阶段赋值。

封装不是机械生成 getter / setter，而是让对象始终保持合法状态。例如邮箱修改应经过校验，而不是允许任意 setter 写入。

### 3.2 Java 接口与 TypeScript 接口

TypeScript：

```ts
interface UserRepository {
  findById(id: number): User | undefined;
}
```

Java：

```java
public interface UserRepository {
    Optional<User> findById(Long id);
}
```

共同点是定义调用方可以依赖的契约，支持多态和替换实现。关键区别：

- TypeScript 接口主要用于静态类型检查，编译成 JavaScript 后通常不存在。
- Java 接口会进入 `.class` 类型信息，可被 JVM、反射和框架识别。
- Java 类通过 `implements` 显式实现接口。
- Java 接口可包含抽象方法、`default`、`static` 和 `private` 方法。
- 接口字段隐式为 `public static final` 常量，不适合保存实例状态。

```java
public interface Greeter {
    String greet(String name);

    default String greetGuest() {
        return format("Guest");
    }

    static Greeter english() {
        return name -> "Hello, " + name;
    }

    private String format(String name) {
        return "Welcome, " + name;
    }
}
```

### 3.3 面向接口编程与多态

```java
UserRepository repository = new InMemoryUserRepository();
UserService service = new UserService(repository);
```

`UserService` 依赖 `UserRepository` 契约，而不是依赖内存实现。未来可以新增 `JdbcUserRepository`，上层业务代码仍使用同一套契约。

这就是多态：同一个接口引用可以指向不同实现。

> **必须讲清**：“面向接口”不是给每个类都创建接口，而是在存在替换实现、外部依赖或重要边界时隔离变化。

### 3.4 组合优先于继承

```java
public final class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }
}
```

`UserService` 拥有并使用 `UserRepository`，这是组合。组合通常比继承更适合表达“使用某种能力”，因为耦合更低、实现可替换、测试更容易，也不会暴露不必要的父类 API。

继承适合稳定的“is-a”关系和框架扩展点，不应只为复用几行代码使用。

### 3.5 接口还是抽象类

| 问题 | 接口 | 抽象类 |
|---|---|---|
| 一个类能拥有多个吗 | 可实现多个接口 | 只能继承一个类 |
| 能否保存实例状态 | 不能保存普通实例字段 | 可以 |
| 能否有构造器 | 不能 | 可以 |
| 主要用途 | 定义能力和边界 | 共享状态、模板和部分实现 |
| 适合变化方向 | 多种类型实现同一能力 | 同一族对象共享基础实现 |

默认从接口和组合开始；只有确实需要共享状态或模板算法时再考虑抽象类。

### 3.6 DTO、实体类、`record` 与 `Map`

```java
public record CreateUserCommand(
        String name,
        String email,
        List<String> skills
) {}
```

`record` 适合表达以数据为主的不可变载体。编译器生成构造器、访问器、`equals()`、`hashCode()` 和 `toString()`。

但它不是任何实体的默认选择：框架实体可能需要特殊构造或可变生命周期；record 字段引用不可重赋值也不代表内部可变集合被深拷贝。

长期使用 `Map<String, Object>` 传递稳定业务结构会失去字段名检查、明确类型、IDE 重构、校验边界和清晰 API 文档。

```java
Map<String, Object> user = new HashMap<>();
user.put("name", "Alice");
user.put("emial", "alice@example.com"); // 拼写错误无法在编译期发现
```

但以下场景合理使用 Map：

- 动态属性和用户自定义字段；
- 统计分组、索引、缓存；
- 尚未确定结构的 JSON 边界解析；
- 框架元数据、请求头和配置；
- Key 本身就是业务维度的数据。

判断标准不是“Map 好不好”，而是数据结构是否稳定、是否值得建立显式类型。

---

## 4. 泛型与集合框架

### 4.1 集合关系图

```text
Iterable
└── Collection
    ├── List
    │   ├── ArrayList
    │   └── LinkedList
    ├── Set
    │   ├── HashSet
    │   ├── LinkedHashSet
    │   └── TreeSet
    └── Queue / Deque
        ├── ArrayDeque
        └── LinkedList

Map（不继承 Collection）
├── HashMap
├── LinkedHashMap
└── TreeMap
```

`Map` 不属于 `Collection`，因为它存储 Key–Value 映射，而不是单值元素序列。

### 4.2 泛型解决什么问题

没有泛型时，读取结果需要强制转换，错误可能延迟到运行时：

```java
List values = new ArrayList();
values.add("Java");
values.add(21);
String name = (String) values.get(1); // ClassCastException
```

使用泛型后，错误提前到编译期：

```java
List<String> values = new ArrayList<>();
values.add("Java");
// values.add(21); // 编译错误
```

泛型参数必须是引用类型，因此不能写 `List<int>`，而要写：

```java
List<Integer> scores = new ArrayList<>();
scores.add(100); // 自动装箱
```

Java 泛型通常通过类型擦除实现。`List<String>` 和 `List<Integer>` 运行时通常都是 `List`，但编译器负责检查并插入必要转换。

#### `List<Object>` 不是 `List<String>` 的父类型

```java
List<String> names = new ArrayList<>();
// List<Object> values = names; // 编译错误

static void printAll(List<?> values) {
    for (Object value : values) {
        System.out.println(value);
    }
}
```

否则调用方就可能向字符串列表加入整数。PECS 属于后续泛型进阶，第一天只需记住：`? extends T` 偏读取，`? super T` 偏写入。

### 4.3 `List`：有顺序、可重复、可按索引访问

```java
List<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Alice");
System.out.println(names.get(1)); // Bob
```

#### ArrayList

- 内部使用可扩容数组保存元素引用。
- 按索引读取通常为 O(1)。
- 尾部追加平均（摊销）O(1)，扩容时会复制数组。
- 中间插入或删除通常要移动后续元素，为 O(n)。
- 引用按索引存放，但引用指向的对象不保证在内存中连续排列。

#### LinkedList

- JDK 实现为双向链表。
- 按索引访问需要沿节点遍历，为 O(n)。
- 已经持有目标节点或迭代器位置时，链接插入/删除可为 O(1)。
- 如果先通过索引找位置，整体仍为 O(n)。
- 每个节点保存前后引用，内存开销更高，缓存局部性通常较差。

默认优先 `ArrayList`。实现栈和队列通常优先 `ArrayDeque`。只有明确需要链表语义并经过测量后，再考虑 `LinkedList`。

| 操作 | ArrayList | LinkedList |
|---|---:|---:|
| `get(index)` | O(1) | O(n) |
| 尾部添加 | 摊销 O(1) | O(1) |
| 已知位置插入/删除 | O(n) | 链接操作 O(1) |
| 按索引定位后插入 | O(n) | O(n) |
| 内存局部性 | 较好 | 较差 |

复杂度描述增长趋势，不等于实际性能；数据规模、CPU 缓存、装箱和访问模式都会影响结果。

### 4.4 `Set`：元素唯一，但 Set 不等于无序

```java
Set<String> skills = new HashSet<>();
skills.add("Java");
boolean added = skills.add("Java");
System.out.println(added); // false
```

`Set` 的核心契约是“不包含重复元素”。不同实现有不同顺序语义：

| 实现 | 顺序 |
|---|---|
| `HashSet` | 不保证迭代顺序 |
| `LinkedHashSet` | 通常按插入顺序迭代 |
| `TreeSet` | 按自然顺序或 Comparator 排序 |

因此准确说法是：Set 接口不提供索引，具体实现决定迭代顺序。

#### HashSet 如何判断重复

1. 使用元素的 `hashCode()` 定位候选桶。
2. 哈希相同不代表对象相等，还要结合 `equals()`。
3. `equals()` 为 true 的对象必须有相同 `hashCode()`。

`HashSet` 在 JDK 中基于 `HashMap` 实现，元素作为 Map 的 Key 存储。

### 4.5 `Map`：Key–Value 映射

```java
Map<Long, User> users = new HashMap<>();
users.put(1L, alice);

User found = users.get(1L);
User missing = users.get(99L); // null
```

如果需要区分“Key 不存在”和“Key 存在但 Value 为 null”，使用 `containsKey`。业务 Repository 也可返回 `Optional<User>`，避免把 null 语义传播到上层。

| 实现 | 特征 |
|---|---|
| `HashMap` | 平均 O(1) 查找；不保证迭代顺序 |
| `LinkedHashMap` | 保留插入顺序或访问顺序 |
| `TreeMap` | 按 Key 排序，典型操作 O(log n) |

`HashMap` 允许一个 null Key 和多个 null Value，但工程代码应按 API 契约谨慎使用。

### 4.6 `equals()` 与 `hashCode()` 契约

自定义对象作为 `HashSet` 元素或 `HashMap` Key 时，必须正确实现二者：

```java
@Override
public boolean equals(Object other) {
    if (this == other) {
        return true;
    }
    if (!(other instanceof User user)) {
        return false;
    }
    return Objects.equals(id, user.id);
}

@Override
public int hashCode() {
    return Objects.hash(id);
}
```

核心契约：

- 相等对象必须有相同哈希值。
- 相同哈希值的对象不一定相等，哈希冲突合法。
- `equals()` 应满足自反、对称、传递、一致，并正确处理 null。
- 参与二者计算的字段在对象作为 Key 期间不应变化。

如果对象放入 HashSet 后修改了参与哈希的字段，后续 `contains` 可能失败。Hash Key 应优先使用不可变值，如 `String`、`Long`、UUID 或设计正确的 record。

### 4.7 顺序、空值、不可变与线程安全

- API 需要稳定顺序时，显式选择 `List`、`LinkedHashSet` 或 `LinkedHashMap`。
- 不要依赖 `HashMap` / `HashSet` 当前“看起来稳定”的输出顺序。
- `List.of`、`Set.of`、`Map.of` 不接受 null，也不支持增删。
- `Collections.unmodifiableList(original)` 是只读视图；原集合变化后视图仍会变化。
- 需要不可修改快照时，可使用 `List.copyOf(original)`。
- `ArrayList`、`HashSet`、`HashMap` 默认都不是线程安全集合。

并发集合和锁留到后续专题，不要以为换成并发集合就自动解决跨操作原子性。

### 4.8 集合选型速查

| 需求 | 推荐起点 | 原因 |
|---|---|---|
| 有序、可重复列表 | `ArrayList` | 索引访问快，通用默认选择 |
| 去重，不关心顺序 | `HashSet` | 平均查找快 |
| 去重且保留插入顺序 | `LinkedHashSet` | 同时表达唯一和顺序 |
| Key–Value 快速查找 | `HashMap` | 平均 O(1) 查找 |
| Key–Value 且保留插入顺序 | `LinkedHashMap` | 输出稳定 |
| 按 Key 排序 | `TreeMap` | 自动排序，O(log n) |
| 队列或栈 | `ArrayDeque` | 通常优于 `LinkedList` 和旧 `Stack` |

---

## 5. 完整案例：内存版用户管理系统

### 5.1 需求

实现以下能力：

- 创建、按 ID 查询、修改、删除和列出用户；
- 邮箱唯一；
- 技能去重并保留输入顺序；
- 校验空名称、非法邮箱和重复邮箱。

### 5.2 为什么这样分层

```text
App
 │ 调用
 ▼
UserService        业务规则：校验、标准化、唯一性
 │ 依赖接口
 ▼
UserRepository     契约：保存、查询、删除
 │ 由其实现
 ▼
InMemoryUserRepository
 │ 使用
 ▼
LinkedHashMap<Long, User>
```

- `User`：明确表达业务数据和相等语义。
- `UserRepository`：隔离数据来源。
- `InMemoryUserRepository`：用集合实现仓储契约。
- `UserService`：放业务规则，不把规则塞进启动类或 Map。
- `App`：组装对象并演示用例。

未来切换数据库时，主要增加 `JdbcUserRepository`，而不是重写所有业务规则。

### 5.3 项目目录

```text
day1-user-management/
├── pom.xml
└── src/main/java/com/example/day1/
    ├── App.java
    ├── User.java
    ├── UserRepository.java
    ├── InMemoryUserRepository.java
    └── UserService.java
```

### 5.4 关键实现讲解

#### 为什么使用 `LinkedHashMap`

```java
private final Map<Long, User> users = new LinkedHashMap<>();
```

按 ID 查询是核心需求，Map 直接表达“ID → User”索引。选择 `LinkedHashMap` 是为了让演示输出保持创建顺序。

#### 为什么使用 `LinkedHashSet`

```java
LinkedHashSet<String> normalized = new LinkedHashSet<>();
for (String skill : skills) {
    if (skill != null && !skill.isBlank()) {
        normalized.add(skill.trim());
    }
}
```

它同时完成空值过滤、首尾空格清理、去重和保留首次出现顺序。

#### 为什么 Repository 返回 `Optional`

```java
Optional<User> findById(Long id);
```

它显式表达“可能找不到”，促使调用方处理缺失情况。`Optional` 主要适合作为方法返回值，不应机械用作所有字段类型。

#### 为什么业务校验放在 Service

```java
if (repository.existsByEmail(normalizedEmail, null)) {
    throw new IllegalArgumentException("邮箱已存在: " + normalizedEmail);
}
```

邮箱唯一是业务规则；内存仓储负责存取，Service 决定是否允许保存。

### 5.5 预期运行结果

```text
创建后:
User{id=1, name='Alice', email='alice@example.com', skills=[Java, TypeScript]}
User{id=2, name='Bob', email='bob@example.com', skills=[Vue, Java]}

按 ID 查询: Alice
更新后技能: [Java, TypeScript, Spring]
删除 Bob: true
剩余用户数: 1
重复邮箱校验: 邮箱已存在: alice@example.com
```

完整代码见附录 A。

> **现场演示建议**：先运行成功流程，再尝试空名称、重复邮箱和错误格式，展示异常。最后把 Repository 变量声明从具体实现改为接口类型，强调依赖方向。

---

## 6. 分享时必须能回答的高频问题

### 1. JDK、JRE、JVM 是什么关系？

JVM 运行字节码；JRE 提供 JVM 和运行所需组件；JDK 在此基础上提供编译、打包、文档等开发工具。开发时直接安装 JDK。

### 2. Java 是编译型还是解释型？

源码先编译成字节码；JVM 运行时可以解释字节码，也可以 JIT 编译热点代码。简单二选一无法准确描述。

### 3. 字节码为什么能跨平台？

字节码面向 JVM 规范，各平台 JVM 将其转成对应机器可执行形式。但本地库、路径、权限等仍可能破坏跨平台性。

### 4. `main` 为什么是 `public static void`？

这是启动器约定。`public` 允许访问，`static` 避免先构造对象，`void` 表示入口不返回 Java 值。

### 5. public 类名为什么与文件名一致？

Java 的编译和类型查找约定要求 public 顶级类型可从源文件名定位；一个文件最多有一个 public 顶级类。

### 6. Java 是不是万物皆对象？

不是。Java 大量使用类和对象组织程序，但存在八种基本类型；包装类让基本值参与泛型和对象 API。

### 7. 为什么局部变量没有默认值？

编译器要求局部变量在读取前明确赋值，以提前发现遗漏。字段和数组元素才会自动初始化。

### 8. `int` 和 `Integer` 怎么选？

一定有数值、追求简单值语义时用 `int`；需要泛型、可空状态或对象 API 时用 `Integer`。注意 null 拆箱和 `==` 陷阱。

### 9. `String` 为什么不可变？

不可变便于安全共享、字符串池、哈希缓存和作为 Map Key，也降低并发读取风险。循环拼接用 `StringBuilder`。

### 10. `==` 和 `equals()` 怎么选？

基本类型 `==` 比值；引用类型 `==` 比是否同一对象。比较对象业务内容通常使用正确实现的 `equals()`。

### 11. Java 是值传递还是引用传递？

始终值传递。对象参数传递引用值的副本；副本仍指向同一对象，所以可观察到对象内部变化，但不能替换调用方变量的引用。

### 12. `static` 是什么？

`static` 成员属于类而非实例，适合无实例状态的工具、常量和入口；不应被用来逃避对象建模和依赖管理。

### 13. 重载和重写有什么区别？

重载是相同方法名、不同参数列表；重写是子类或实现类提供父类/接口方法的新实现。重写具有运行时多态。

### 14. Java 接口为什么运行时还存在？

接口会编译为 `.class` 类型信息，JVM 可检查实现关系，反射和框架也能读取；TypeScript 接口通常只存在于类型检查阶段。

### 15. 接口和抽象类怎么选？

定义能力、边界和多实现时优先接口；需要共享实例状态、构造流程或模板实现时考虑抽象类。

### 16. 为什么默认推荐 ArrayList？

它索引读取快、内存局部性较好、尾部追加性能优秀。LinkedList 的 O(1) 插入只有在已定位节点时才成立。

### 17. Set 是不是无序？

不能这样概括。Set 核心是唯一性；`HashSet` 不保证顺序，`LinkedHashSet` 保留插入顺序，`TreeSet` 提供排序。

### 18. HashSet 如何判断重复？

先用 `hashCode()` 缩小候选范围，再用 `equals()` 判断逻辑相等。哈希相同不一定相等，相等则必须哈希相同。

### 19. 为什么重写 equals 还要重写 hashCode？

哈希集合依赖二者共同工作。相等对象哈希不同会进入不同桶，造成重复或查询失败。

### 20. 为什么 Map 的 Key 最好不可变？

Key 放入 Map 后若参与哈希的字段变化，后续查询会使用新哈希位置，可能找不到原条目。

### 21. 为什么 `List<int>` 不合法？

Java 泛型参数必须是引用类型，因此使用 `List<Integer>`，由编译器协助装箱拆箱。

### 22. `HashMap` 线程安全吗？

不是。多线程共享修改需要并发设计；`ConcurrentHashMap` 也不能自动保证跨多个操作的业务原子性。

### 23. `List.of` 与 `new ArrayList<>()` 有什么区别？

`List.of` 返回不可修改且拒绝 null 的集合；`ArrayList` 可增删。对外暴露集合要明确 API 的可变性契约。

### 24. 用 Map 当 DTO 一定错误吗？

不是。稳定业务结构更适合显式类或 record；动态属性、索引、分组、配置和不确定 JSON 使用 Map 很合理。

---

## 7. 练习题

### 7.1 输出预测

#### 题 1：包装类比较

```java
Integer a = 100;
Integer b = 100;
Integer x = 1000;
Integer y = 1000;

System.out.println(a == b);
System.out.println(x == y);
System.out.println(x.equals(y));
```

#### 题 2：值传递

```java
static void change(String value) {
    value = "Spring";
}

String value = "Java";
change(value);
System.out.println(value);
```

#### 题 3：Set 顺序

```java
Set<String> values = new HashSet<>();
values.add("B");
values.add("A");
values.add("C");
System.out.println(values);
```

能否承诺输出一定是 `[A, B, C]`？

### 7.2 错误排查

#### 题 4：局部变量

```java
int count;
System.out.println(count);
```

为什么不能编译？

#### 题 5：泛型

```java
List<int> scores = new ArrayList<>();
```

如何修复？为什么？

#### 题 6：HashSet 去重失败

两个 ID 相同的自定义 `User` 对象加入 HashSet 后为什么可能得到 size 2？应该怎么改？

### 7.3 设计题

#### 题 7：集合选型

1. 保存文章列表，允许同一作者有多篇文章，需要分页。
2. 保存用户关注标签，需要去重并保留关注顺序。
3. 根据用户 ID 快速查找用户。
4. 保存排行榜，要求按分数自动排序。
5. 实现先进先出的任务队列。

#### 题 8：改造用户系统

增加“按技能查询用户”功能。思考：小数据是否可直接遍历？数据量增大后增加什么索引？更新和删除时如何保持一致？

---

## 8. 练习答案

题 1 在默认 OpenJDK 21 配置下的常见输出：

```text
true
false
true
```

前两个结果来自包装类引用和缓存行为；内容比较使用 `equals()`。

其中 `100` 位于规范要求的最小缓存范围内，因此前一个 `true` 可依赖；`1000` 是否扩展缓存属于实现选择，不能把第二个结果写进业务判断。

题 2 输出 `Java`，因为方法只修改局部引用副本。

题 3 不能承诺。需要插入顺序时使用 `LinkedHashSet`。

题 4：局部变量读取前必须明确赋值，例如 `int count = 0;`。

题 5：改成 `List<Integer> scores = new ArrayList<>();`，因为泛型参数必须是引用类型。

题 6：类型没有按稳定业务标识同时实现 `equals()` 和 `hashCode()`，Object 默认比较对象身份。

题 7：

1. `ArrayList<Article>`；
2. `LinkedHashSet<String>`；
3. `HashMap<Long, User>`；
4. 根据更新与查询模式选择 `TreeMap`、排序 List 或优先队列，还需明确分数重复与 Top-N 需求；
5. `ArrayDeque<Task>`。

题 8：小数据可遍历；数据量和频率增大后可维护 `Map<String, Set<Long>>` 技能倒排索引。创建、更新、删除时必须同步更新主存储和索引。

---

## 9. 一页检查清单

### 运行与工程

- [ ] 我能解释 `.java → .class → JVM`。
- [ ] 我能区分 JDK、JRE、JVM。
- [ ] 我能使用 `javac` 和 `java` 编译运行。
- [ ] 我知道 `main`、`package`、`import` 和 classpath 的基础作用。
- [ ] 我知道 Maven 标准目录和 `pom.xml` 的用途。

### 类型与方法

- [ ] 我能说出八种基本类型及包装类。
- [ ] 我知道局部变量没有可直接读取的默认值。
- [ ] 我能解释 `String` 不可变、`==` 与 `equals()`。
- [ ] 我能解释装箱、拆箱和 `Integer` 比较陷阱。
- [ ] 我能解释 Java 始终按值传递。
- [ ] 我能区分重载、重写、静态方法和实例方法。

### 面向对象与集合

- [ ] 我能区分类、对象、构造器和封装。
- [ ] 我能比较 Java 接口和 TypeScript 接口。
- [ ] 我知道接口、抽象类、组合和继承的选择边界。
- [ ] 我知道稳定 DTO 为什么通常不应使用 `Map<String, Object>`。
- [ ] 我知道为什么不能写 `List<int>`。
- [ ] 我能根据需求选择 List、Set、Map。
- [ ] 我能准确描述 ArrayList 与 LinkedList 的复杂度边界。
- [ ] 我知道 Set 不等于无序。
- [ ] 我能解释 `equals()` / `hashCode()` 契约和可变 Key 风险。
- [ ] 我知道常用集合默认不保证线程安全。

---

## 10. 术语表

| 术语 | 简明解释 |
|---|---|
| Bytecode | Java 编译器生成、由 JVM 执行的中间指令 |
| Classpath | 编译器和 JVM 查找类与资源的位置集合 |
| JIT | 运行时将热点字节码编译为机器码的机制 |
| Primitive | Java 八种基本类型 |
| Reference | 指向对象的引用值，可为 null |
| Boxing / Unboxing | 基本类型与包装类之间的转换 |
| Generic | 参数化类型，用于提前检查元素类型 |
| Contract | 调用方与实现方共同遵守的行为约定 |
| Polymorphism | 同一契约对应不同实现 |
| Immutable | 创建后可观察状态不再变化 |
| Hash Collision | 不同对象产生相同哈希值 |
| Amortized O(1) | 多次操作平均后为常数复杂度，单次可能更慢 |
| DTO | 跨层或接口传递数据的明确结构 |
| Repository | 隔离数据访问方式的业务边界 |

---

## 11. 下一步学习路线

1. 异常处理、文件与 JSON I/O。
2. Lambda、Stream、Optional 的工程使用边界。
3. JUnit 5、测试设计和 Maven 生命周期。
4. Spring Boot、REST API、参数校验和统一异常处理。
5. MySQL、事务、索引和 Repository 数据库实现。
6. 异步编程、线程池、SSE 流式输出。
7. Spring AI、Tool Calling、RAG 和 Agent 工作流。

不要急着同时学习多个框架。先把本讲义中的用户管理案例做到能运行、能解释、能测试、能改造。

---

## 12. 官方参考资料

- [Dev.java：Learn Java](https://dev.java/learn/)
- [Java SE 21 API Documentation](https://docs.oracle.com/en/java/javase/21/docs/api/)
- [Java Language Specification, Java SE 21](https://docs.oracle.com/javase/specs/jls/se21/html/)
- [OpenJDK JDK 21](https://openjdk.org/projects/jdk/21/)
- [Maven Standard Directory Layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html)
- [Maven POM Introduction](https://maven.apache.org/guides/introduction/introduction-to-the-pom.html)

---

# 附录 A：完整可运行代码

## A.1 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>day1-user-management</artifactId>
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

## A.2 `User.java`

```java
package com.example.day1;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

public final class User {
    private final Long id;
    private final String name;
    private final String email;
    private final Set<String> skills;

    public User(Long id, String name, String email, Set<String> skills) {
        this.id = id;
        this.name = Objects.requireNonNull(name, "name 不能为空");
        this.email = Objects.requireNonNull(email, "email 不能为空");
        this.skills = Collections.unmodifiableSet(new LinkedHashSet<>(skills));
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
        return new User(newId, name, email, skills);
    }

    public User withProfile(String newName, Set<String> newSkills) {
        return new User(id, newName, email, newSkills);
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

> 该示例让已分配 ID 的用户按 ID 判断相等，未保存用户保持身份相等。真实领域模型的相等策略应根据稳定业务标识设计，不能机械照抄。

## A.3 `UserRepository.java`

```java
package com.example.day1;

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

## A.4 `InMemoryUserRepository.java`

```java
package com.example.day1;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class InMemoryUserRepository implements UserRepository {
    private final Map<Long, User> users = new LinkedHashMap<>();
    private long nextId = 1L;

    @Override
    public User save(User user) {
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
        return new ArrayList<>(users.values());
    }

    @Override
    public boolean existsByEmail(String email, Long excludedUserId) {
        return users.values().stream()
                .anyMatch(user -> user.getEmail().equalsIgnoreCase(email)
                        && !user.getId().equals(excludedUserId));
    }

    @Override
    public boolean deleteById(Long id) {
        return users.remove(id) != null;
    }
}
```

## A.5 `UserService.java`

```java
package com.example.day1;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.Set;

public final class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public User create(String name, String email, List<String> skills) {
        String normalizedName = requireText(name, "name");
        String normalizedEmail = normalizeEmail(email);

        if (repository.existsByEmail(normalizedEmail, null)) {
            throw new IllegalArgumentException("邮箱已存在: " + normalizedEmail);
        }

        User user = new User(
                null,
                normalizedName,
                normalizedEmail,
                normalizeSkills(skills)
        );
        return repository.save(user);
    }

    public User findById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("id 必须为正整数");
        }
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("用户不存在: " + id));
    }

    public User updateProfile(Long id, String name, List<String> skills) {
        User existing = findById(id);
        User updated = existing.withProfile(
                requireText(name, "name"),
                normalizeSkills(skills)
        );
        return repository.save(updated);
    }

    public boolean delete(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("id 必须为正整数");
        }
        return repository.deleteById(id);
    }

    public List<User> listAll() {
        return repository.findAll();
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " 不能为空");
        }
        return value.trim();
    }

    private static String normalizeEmail(String email) {
        String normalized = requireText(email, "email").toLowerCase(Locale.ROOT);
        int at = normalized.indexOf('@');
        if (at <= 0 || at == normalized.length() - 1) {
            throw new IllegalArgumentException("email 格式不正确: " + email);
        }
        return normalized;
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

## A.6 `App.java`

```java
package com.example.day1;

import java.util.List;

public final class App {
    private App() {
    }

    public static void main(String[] args) {
        UserRepository repository = new InMemoryUserRepository();
        UserService service = new UserService(repository);

        User alice = service.create(
                " Alice ",
                "ALICE@example.com",
                List.of("Java", "TypeScript", "Java", " ")
        );
        User bob = service.create(
                "Bob",
                "bob@example.com",
                List.of("Vue", "Java")
        );

        System.out.println("创建后:");
        service.listAll().forEach(System.out::println);

        System.out.println("\n按 ID 查询: " + service.findById(alice.getId()).getName());

        User updatedAlice = service.updateProfile(
                alice.getId(),
                "Alice",
                List.of("Java", "TypeScript", "Spring", "Spring")
        );
        System.out.println("更新后技能: " + updatedAlice.getSkills());

        System.out.println("删除 Bob: " + service.delete(bob.getId()));
        System.out.println("剩余用户数: " + service.listAll().size());

        try {
            service.create("Another Alice", "alice@example.com", List.of("Agent"));
        } catch (IllegalArgumentException exception) {
            System.out.println("重复邮箱校验: " + exception.getMessage());
        }
    }
}
```

## A.7 编译运行

在项目根目录执行：

```bash
mvn compile
java -cp target/classes com.example.day1.App
```

也可以直接在 IntelliJ IDEA 中运行 `App.main()`。

---

## 附录 B：分享者答疑策略

当听众继续深挖时，使用下面的回答结构：

1. **先给结论**：用一句话回答选择。
2. **再给边界**：说明结论在哪些条件下成立。
3. **给反例**：避免绝对化。
4. **回到案例**：指出用户管理项目为何这样设计。

示例：

> 问：是不是永远选 ArrayList？  
> 答：不是。业务列表默认优先 ArrayList，因为随机访问和局部性更好；需要双端队列时通常选 ArrayDeque，只有明确链表访问模式并验证收益时才考虑 LinkedList。我们的案例按 ID 查用户，所以主存储不是 List，而是 LinkedHashMap。

遇到尚未学习的 Spring、数据库和并发问题，可以明确说明边界：

> 今天先讲语言和集合契约。数据库事务、Spring Bean 生命周期、并发集合内部实现将在后续专题展开；当前案例只保证单线程内存语义。
