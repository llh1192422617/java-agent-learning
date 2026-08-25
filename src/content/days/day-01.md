---
day: 1
title: Java 核心速通——从前端思维到可运行的后端代码
date: '2026-08-24'
summary: 掌握 Java 运行链路、Maven 工程、类型与方法、面向对象、泛型集合及内存版用户管理案例。
tags:
  - Java
  - JVM
  - Maven
  - 面向对象
  - 集合
status: completed
duration: 60–90 分钟
---
# Day 1：Java 核心速通——从前端思维到可运行的后端代码

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

#### 先回答：Maven 是什么

Maven 是 Java 生态中常用的**项目构建与依赖管理工具**。它不是 Java 编译器，也不是 IDE：真正编译 Java 的仍然是 JDK 中的 `javac`；Maven 负责读取项目配置、下载依赖，并按照统一流程调用编译、测试和打包工具。

可以先把它有限类比为前端的：

```text
npm / pnpm + package.json + 一组约定好的构建脚本
```

但 Maven 更强调“约定优于配置”：只要项目遵循标准目录，大多数插件就知道正式代码、测试代码和构建产物分别在哪里。

#### Maven 解决了什么问题

没有构建工具时，团队需要手工下载 jar、配置 classpath、决定源码目录、逐个执行编译和测试命令。Maven 把这些操作变成可重复的配置和命令，使本地、CI 和其他成员使用相同流程构建项目。

```text
day1-user-management/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/example/day1/App.java
    │   └── resources/
    └── test/
        ├── java/com/example/day1/AppTest.java
        └── resources/
```

运行构建后还会出现 `target/`：

| 位置 | 作用 | 是否手动维护 |
|---|---|---|
| `pom.xml` | 项目的构建说明书 | 是 |
| `src/main/java` | 正式 Java 源码 | 是 |
| `src/main/resources` | 配置文件等运行时资源 | 是 |
| `src/test/java` | 测试源码 | 是 |
| `src/test/resources` | 测试专用资源 | 是 |
| `target/classes` | 编译后的正式类和资源 | 否，由 Maven 生成 |
| `target/test-classes` | 编译后的测试类和资源 | 否，由 Maven 生成 |
| `target/*.jar` | 打包结果 | 否，由 Maven 生成 |

#### `pom.xml` 是什么

POM 全称是 Project Object Model。`pom.xml` 不是程序入口，而是告诉 Maven“这是什么项目、依赖什么、怎样构建”的 XML 文件。

```xml
<project>
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>day1-user-management</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.release>21</maven.compiler.release>
    </properties>
</project>
```

`groupId:artifactId:version` 合称项目坐标：

```text
com.example:day1-user-management:1.0.0
```

- `groupId`：组织或命名空间，常使用反向域名。
- `artifactId`：项目或构件名称。
- `version`：版本号。
- `properties`：可复用的构建属性，这里要求以 Java 21 为目标版本编译。

坐标的作用类似“包名 + 版本”，让仓库和其他项目能够唯一识别一个构件。依赖也通过坐标声明：

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.11.4</version>
    <scope>test</scope>
</dependency>
```

Maven 会从远程仓库解析依赖，并缓存到本机仓库 `~/.m2/repository`。不要把“依赖声明”理解成把源码复制到项目中；构建时 Maven 会把对应 jar 加入 classpath。

#### 命令执行时发生了什么

```bash
mvn compile
mvn test
mvn package
```

| 命令 | 主要结果 |
|---|---|
| `mvn compile` | 解析依赖，将 `src/main/java` 编译到 `target/classes` |
| `mvn test` | 先编译正式代码和测试代码，再运行测试 |
| `mvn package` | 先完成前面的必要阶段，再生成 jar 等构件 |
| `mvn clean` | 删除 Maven 生成的 `target` 目录 |
| `mvn clean package` | 从干净状态重新编译、测试并打包 |

执行 `mvn package` 可以形成下面的心智模型：

```text
读取 pom.xml
  → 解析并下载依赖到 ~/.m2/repository
  → 编译 src/main/java
  → 编译并运行 src/test/java
  → 在 target/ 中生成 jar
```

Maven 生命周期不是“一个常驻进程”，而是一组有先后关系的构建阶段。执行后面的阶段会先执行它之前所需的阶段，因此 `mvn package` 不只是“压缩一下文件”。

#### Maven、JDK 和 IntelliJ IDEA 的关系

| 工具 | 核心职责 |
|---|---|
| JDK | 提供 `javac`、`java`、`jar` 等底层开发和运行工具 |
| Maven | 读取 POM、解析依赖、组织并执行编译测试打包流程 |
| IntelliJ IDEA | 编辑、导航、调试代码，并调用 JDK 或 Maven 执行任务 |

即使不用 IntelliJ IDEA，Maven 项目也应能在终端中构建；这保证 CI 服务器和其他开发者不依赖你的个人 IDE 配置。

> **面试回答：为什么使用 Maven？**
> Maven 通过标准目录、项目坐标、依赖管理、插件和构建生命周期，让项目使用统一命令完成依赖解析、编译、测试与打包。它减少了手工管理 jar 和 classpath 的成本，也让本地与 CI 构建更容易保持一致。JDK 负责真正的编译和运行，Maven 负责组织这些步骤。

> **容易被问**：Maven 和 npm 完全一样吗？
> 不完全一样。两者都能管理依赖和执行构建任务，但 Maven 使用 POM、坐标、生命周期和插件模型，依赖通常是 jar；npm 围绕 `package.json`、脚本和 Node 包工作。这个类比只用于快速建立直觉。

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

#### 面试回答：Java 与 JavaScript / TypeScript 的核心区别是什么？

> Java 是静态类型、以类和类型为主要组织单位、运行在 JVM 上的语言。Java 源码先编译为字节码，再由 JVM 解释执行或 JIT 编译。JavaScript 是动态类型语言，由浏览器或 Node.js 中的 JavaScript 引擎执行；TypeScript 为 JavaScript 增加了编译期类型检查，但类型标注通常在编译后被擦除，运行时仍然执行 JavaScript。

回答时可继续从五个方面展开：

1. **类型检查**：Java 变量和方法签名在编译期受到严格约束；JavaScript 的值类型可在运行时变化；TypeScript 的静态检查不能自动变成运行时校验。
2. **类型兼容**：TypeScript 主要采用结构化类型，只要结构兼容就可能赋值；Java 主要采用名义类型，类通常需要显式声明继承或实现关系。
3. **运行时模型**：Java 类和接口会进入 class 文件及 JVM 类型系统；TypeScript 的 `interface` 通常不会出现在生成的 JavaScript 中。
4. **并发模型**：Java 服务端代码经常运行在多线程环境；前端 JavaScript 主要通过事件循环和异步任务组织并发，但不应简单理解为“运行时只有一个线程”。
5. **工程组织**：Java 常使用 Maven、POM、package 和 classpath；前端常使用 npm / pnpm、`package.json` 和 ES Module。它们可以类比，但不能直接等同。

```typescript
interface Named {
  name: string;
}

const value = { name: "Alice", age: 18 };
const named: Named = value; // 结构满足即可
```

```java
interface Named {
    String name();
}

// 某个类即使碰巧有 name()，也不会自动成为 Named，通常要显式 implements Named。
```

> **迁移提醒**：前端经验可以帮助你理解类型、接口、依赖和异步，但进入 Java 后要重新建立名义类型、`null`、异常、多线程以及构建工具的心智模型。

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

Java 为八种基本类型分别提供了一个包装类。两者能够表达相同种类的值，但基本类型表示值本身，包装类是引用类型，因而可以表示 `null`、参与泛型，并提供类型转换和比较等工具方法。

#### 八种基本类型与对应包装类

| 基本类型 | 包装类 | 基本类型的取值与特点 | 包装类提供的典型能力 | 特别注意 |
|---|---|---|---|---|
| `byte` | `Byte` | 8 位有符号整数，范围 `-128`～`127` | `Byte.parseByte()`、`Byte.compare()`、`MIN_VALUE`、`MAX_VALUE` | 超出范围的字符串转换会抛出 `NumberFormatException` |
| `short` | `Short` | 16 位有符号整数，范围 `-32768`～`32767` | `Short.parseShort()`、`Short.compare()`、范围常量 | Java 整数字面量和多数整数运算默认按 `int` 处理，赋值或运算时要留意提升与范围 |
| `int` | `Integer` | 32 位有符号整数，范围约为正负 21 亿 | `Integer.parseInt()`、`Integer.compare()`、进制转换、范围常量 | 存在装箱缓存和 `==` 陷阱；整数运算溢出默认不会报错 |
| `long` | `Long` | 64 位有符号整数 | `Long.parseLong()`、`Long.compare()`、无符号相关工具 | 较大的整数字面量通常需要后缀 `L`，例如 `3_000_000_000L` |
| `float` | `Float` | 32 位 IEEE 754 单精度浮点数 | `Float.parseFloat()`、`Float.compare()`、`isNaN()`、`isInfinite()` | 字面量通常要写 `3.14F`；不能用浮点数精确表示金额 |
| `double` | `Double` | 64 位 IEEE 754 双精度浮点数，Java 小数字面量默认类型 | `Double.parseDouble()`、`Double.compare()`、`isNaN()`、`isInfinite()` | 存在精度误差、`NaN` 和无穷大；金额通常使用 `BigDecimal` |
| `char` | `Character` | 16 位 UTF-16 代码单元，使用单引号，例如 `'A'` | `Character.isDigit()`、`isLetter()`、`toUpperCase()` 等字符判断与转换 | 一个 `char` 不一定能表示一个完整 Unicode 字符，部分字符需要两个 `char` |
| `boolean` | `Boolean` | 只有 `true` 和 `false`；语言规范不规定其存储位数 | `Boolean.parseBoolean()`、`Boolean.logicalAnd()` 等 | `Boolean` 还可以为 `null`，形成“真、假、未知”三种状态；使用前要明确业务语义 |

> 表中的“8 位、16 位、32 位、64 位”描述的是 Java 语言规定的值域或表示模型，不应推导为“基本类型一定存栈、包装类一定存堆”。具体存储与 JVM 实现、对象逃逸和编译优化有关。

#### 基本类型与包装类的共同区别

| 对比维度 | 基本类型（以 `int` 为例） | 包装类（以 `Integer` 为例） |
|---|---|---|
| 类型性质 | Java 语言内置的基本类型，变量表示相应的基本值 | 普通引用类型，包装一个基本值 |
| 是否可以为 `null` | 不可以 | 可以，用于表达“缺失、未知、未填写”等状态 |
| 字段默认值 | 数值类型为 `0`、`char` 为 `\u0000`、`boolean` 为 `false` | 所有包装类字段的默认值都是 `null` |
| 局部变量 | 使用前必须明确初始化，没有默认值 | 同样必须明确初始化，没有默认值 |
| 泛型与集合 | 不能写 `List<int>` | 可以写 `List<Integer>` |
| 工具方法 | 本身不能调用方法 | 提供解析、格式转换、比较和范围常量等 API |
| 相等比较 | `==` 比较数值 | `==` 比较是否为同一引用；比较内容使用 `equals()` 或 `Objects.equals()` |
| 类型转换 | 可通过强制转换在基本数值类型之间转换 | 常使用 `parseXxx()`、`valueOf()` 和 `xxxValue()` |
| 自动转换 | 可以被自动装箱为包装类 | 可以被自动拆箱为基本类型 |
| 主要风险 | 数值溢出、窄化转换丢失信息 | `null` 自动拆箱导致 `NullPointerException`、`==` 引用比较、额外装箱开销 |
| 典型选择 | 值一定存在、需要计算或追求简单值语义时优先使用 | 需要可空状态、泛型、集合、反射或框架对象映射时使用 |

所有包装类都是不可变类：创建后其内部表示的值不会改变。所谓“修改一个 `Integer`”，实际是让变量重新指向另一个对象。

```java
Integer boxed = 10; // 自动装箱
int value = boxed;  // 自动拆箱

Integer missing = null;
// int broken = missing; // NullPointerException
```

自动拆箱的代码可能看起来很安全，但 `null` 会在运行时失败：

```java
Integer count = null;
// int total = count + 1;
// 等价于调用 count.intValue() 后再计算，因此会抛 NullPointerException
```

比较可能含有 `null` 的包装类时，优先使用 `Objects.equals()`：

```java
import java.util.Objects;

Integer left = null;
Integer right = null;

System.out.println(Objects.equals(left, right)); // true
System.out.println(Objects.equals(left, 1));     // false
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

规范保证通过自动装箱或 `Integer.valueOf()` 得到的部分常用值至少缓存 `-128` 到 `127`，所以缓存范围内的两个引用可能碰巧满足 `==`。业务代码比较包装类内容时使用 `equals()`；可能出现 `null` 时使用 `Objects.equals()`，不要依赖缓存范围。

#### 面试回答：`int` 和 `Integer` 有什么区别？

> `int` 是基本类型，不能为 `null`，适合确定存在的整数值和数值计算；`Integer` 是引用类型，可以为 `null`，能够用于泛型和集合，并提供解析、比较等工具方法。Java 支持二者之间的自动装箱和拆箱，但对 `null` 拆箱会抛出 `NullPointerException`。`int` 使用 `==` 比较数值，而 `Integer` 的 `==` 比较引用，还可能受到整数缓存影响，所以包装类的内容比较应使用 `equals()` 或 `Objects.equals()`。如果不需要可空状态、泛型或对象 API，通常优先使用 `int`，以减少空指针风险和不必要的装箱。

> **容易被追问**：为什么 `List<int>` 不能编译？因为 Java 泛型的类型参数必须是引用类型，八种基本类型都不能直接作为类型参数，所以需要使用对应包装类，例如 `List<Integer>`。

### 2.5 类型转换与溢出

Java 数值转换分为扩大转换和缩小转换：

- **扩大转换**：目标类型通常能覆盖原类型的取值范围，编译器可以自动完成，例如 `int → long`。
- **缩小转换**：目标类型范围更小，可能丢失高位或精度，必须显式强制转换，例如 `long → int`。

```java
int count = 100;
long total = count; // 扩大转换

long large = 3_000_000_000L;
int overflowed = (int) large; // 缩小转换，可能丢失信息
System.out.println(overflowed); // -1294967296，不是 3000000000

int max = Integer.MAX_VALUE;
System.out.println(max + 1); // -2147483648
```

强制转换只表示“我允许进行这个转换”，不保证结果仍符合业务预期。整数运算溢出也不会默认抛异常；需要检测时可使用：

```java
try {
    int result = Math.addExact(Integer.MAX_VALUE, 1);
} catch (ArithmeticException exception) {
    System.out.println("整数溢出");
}
```

Java 的 `byte`、`short` 和 `char` 参与常见算术运算时通常会先提升为 `int`：

```java
byte left = 10;
byte right = 20;
// byte sum = left + right; // 不能编译，表达式结果类型是 int
int sum = left + right;
```

字符串转数字不属于强制类型转换，应使用解析方法，并处理格式错误：

```java
int port = Integer.parseInt("8080");
// Integer.parseInt("8O8O"); // NumberFormatException，字母 O 不是数字 0
```

> **面试回答**：扩大转换通常可以自动完成；缩小转换需要显式强转但仍可能丢失数据。强转不会进行范围保护，整数溢出也默认不抛异常，关键业务可使用 `Math.*Exact()`、范围检查或更合适的数值类型。

### 2.6 `String`：不可变对象

`String` 不可变的准确含义是：**一个 String 对象创建后，其字符序列不能被修改**。变量仍然可以改为引用另一个 String 对象。

```java
String original = "Java";
String upper = original.toUpperCase();

System.out.println(original); // Java
System.out.println(upper);    // JAVA
```

`toUpperCase()` 没有修改原对象，而是返回了另一个字符串。下面的赋值也不是“修改 Spring 字符串”：

```java
String framework = "Spring";
framework = "Spring Boot"; // 变量改为指向另一个 String 对象
```

不可变性带来的常见收益包括：

- 字符串可以安全地在多个位置共享并进入字符串池；
- 哈希值和内容不会在作为 Map Key 后突然变化；
- API 调用方无法通过引用偷偷修改字符串内容；
- 多线程只读共享更容易推理。

大量循环拼接时使用 `StringBuilder`，避免反复创建中间字符串：

```java
StringBuilder builder = new StringBuilder();
for (int i = 1; i <= 3; i++) {
    builder.append(i).append(',');
}
System.out.println(builder); // 1,2,3,
```

字符串字面量通常会复用字符串池中的对象，但不要把池化当成内容比较规则：

```java
String first = "Java";
String second = "Java";
String third = new String("Java");

System.out.println(first == second); // 通常为 true：字面量复用
System.out.println(first == third);  // false：third 是显式创建的新对象
System.out.println(first.equals(third)); // true：内容相同
```

> **面试回答：String 为什么不可变？**
> 不可变让 String 能够安全共享和池化，适合作为哈希 Key，也降低了安全边界和并发读取的推理成本。字符串拼接会产生新对象，因此大量循环拼接通常使用 `StringBuilder`。不可变的是对象内容，不是保存引用的变量。

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

调用实例方法前要考虑左侧是否为 `null`：

```java
String expected = null;
String actual = "Java";

// expected.equals(actual);          // NullPointerException
System.out.println(Objects.equals(expected, actual)); // false
```

自定义类如果没有重写 `equals()`，会继承 `Object.equals()` 的身份比较行为，效果通常与 `==` 相同。需要按 ID、邮箱等业务字段判断相等时，必须设计并实现一致的 `equals()` / `hashCode()` 契约，见 [4.6 节](#46-equals-与-hashcode-契约)。

> **面试回答**：基本类型的 `==` 比较值；引用类型的 `==` 比较两个引用是否指向同一对象。`equals()` 用于内容或业务相等，但最终语义由类实现。字符串和包装类的内容比较通常使用 `equals()`，可能为 null 时使用 `Objects.equals()`。

> **现场演示**：比较字符串字面量与 `new String(...)`，解释为什么不能根据某一次 `==` 的结果推断字符串内容相等。

### 2.8 项目所需的控制流

Java 没有 JavaScript 的 truthy / falsy：

```java
int count = 1;
// if (count) {} // 编译错误

if (count > 0) {
    System.out.println("有数据");
}
```

`if` 的条件必须是 `boolean`。增强 `for` 用于依次读取数组或 `Iterable` 中的元素：

```java
List<String> names = List.of("Alice", "Bob");

for (String name : names) {
    System.out.println(name);
}
```

这里可以读作“对 names 中的每一个 String name 执行循环体”。它适合遍历，不提供当前索引；需要索引时使用普通 `for`。

Java 21 的 `switch` 可以作为表达式产生结果：

```java
String role = "admin";

String roleName = switch (role) {
    case "admin" -> "管理员";
    case "user" -> "普通用户";
    default -> "未知角色";
};

System.out.println(roleName); // 管理员
```

箭头右侧是该分支产生的结果，`default` 处理没有明确列出的值。第一天不必背完 `for`、`while`、`switch` 的所有形式，重点是能读懂案例中的判断和遍历。

### 2.9 方法、返回值、重载与 `static`

#### 方法声明怎么读

```java
public static int add(int a, int b) {
    return a + b;
}
```

| 部分 | 名称 | 含义 |
|---|---|---|
| `public` | 访问修饰符 | 其他类也可以调用 |
| `static` | 静态修饰符 | 方法属于类，不需要先创建对象 |
| `int` | 返回值类型 | 调用完成后必须返回一个 `int` |
| `add` | 方法名 | 调用者使用的名称 |
| `int a, int b` | 形式参数列表 | 声明需要接收两个整数 |
| `return a + b` | 返回语句 | 结束本次调用并把结果交给调用者 |

完整调用过程：

```java
public final class Calculator {
    private Calculator() {
    }

    public static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        int result = Calculator.add(10, 20);
        System.out.println(result); // 30
    }
}
```

- `a`、`b` 是方法声明中的**形式参数**。
- `10`、`20` 是调用时传入的**实际参数**。
- `30` 是方法返回的值，被保存到 `result`。

#### `return` 不等于打印

```java
static int calculateSum(int a, int b) {
    return a + b;
}

static void printSum(int a, int b) {
    System.out.println(a + b);
}

int total = calculateSum(10, 20); // 可以继续使用返回值
// int broken = printSum(10, 20); // 不能编译：void 没有返回值
```

`return` 把结果交给调用者；`System.out.println()` 只是把文本写到控制台。`void` 表示方法正常完成时不向调用者提供结果，但仍可写 `return;` 提前结束方法。

#### 方法重载

```java
public static int add(int a, int b) {
    return a + b;
}

public static long add(long a, long b) {
    return a + b;
}

int intResult = add(1, 2);       // 编译器选择 int 版本
long longResult = add(1L, 2L);   // 编译器选择 long 版本
```

这两个 `add` 构成方法重载（overload）：方法名相同，参数列表不同。重载在编译期根据实参类型选择。

以下方式可以构成重载：

- 参数数量不同；
- 参数类型不同；
- 参数类型的排列顺序不同。

返回类型不属于 Java 方法签名，不能只靠返回类型区分重载：

```java
// 不能同时声明：方法名和参数列表完全相同
// static int find(long id) { ... }
// static User find(long id) { ... }
```

#### `static` 方法与实例方法

```java
public final class Counter {
    private int value;

    public void increment() { // 实例方法
        value++;
    }

    public int getValue() {
        return value;
    }

    public static int doubleValue(int input) { // 静态方法
        return input * 2;
    }
}

Counter counter = new Counter();
counter.increment();
System.out.println(counter.getValue());       // 1
System.out.println(Counter.doubleValue(10));  // 20
```

实例方法通过具体对象调用，可以访问该对象的字段和 `this`；静态方法通过类调用，没有某个特定实例的 `this`，因此不能直接访问实例字段。

`static` 方法属于类本身，不依赖某个对象实例。不要为了方便把所有方法都写成 `static`；业务状态和可替换依赖通常由对象协作表达。

> **面试回答：什么是方法重载？**
> 重载是在同一个类型中声明同名但参数列表不同的方法，编译器根据调用参数在编译期选择目标。返回值类型不属于方法签名，因此只改变返回值不能形成重载。它与“子类在运行时提供不同实现”的重写不是一回事。

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

用可变 List 对比更直观：

```java
static void addSkill(List<String> skills) {
    skills.add("Spring"); // 通过复制来的引用操作同一个 List 对象
}

static void replaceList(List<String> skills) {
    skills = new ArrayList<>(); // 只改变局部引用副本
    skills.add("Go");
}

List<String> skills = new ArrayList<>(List.of("Java"));
addSkill(skills);
System.out.println(skills); // [Java, Spring]

replaceList(skills);
System.out.println(skills); // 仍然是 [Java, Spring]
```

可以把调用过程理解为：

```text
调用前：外部变量 skills ───────→ 同一个 ArrayList 对象
传参后：参数副本 skillsCopy ───→ 同一个 ArrayList 对象
```

通过任一引用修改对象，另一方都能观察到；但给参数副本重新赋值，不会改变调用方变量。

> **面试回答**：Java 只有值传递。基本类型参数复制基本值；引用类型参数复制引用值。两个引用副本可以指向同一个可变对象，因此对象状态可能被修改，但被调用方法无法直接把调用方的变量改为指向另一个对象。

> **容易被问**：为什么传入 `List` 后，方法里 `add` 会影响外部？
> 因为内外两个引用值都指向同一个可变 List 对象。复制的是引用值，不是对象本身。

---

## 3. 面向对象：让业务代码拥有明确边界

### 3.1 类、对象、构造器与封装

- **类（class）**是对一类对象的状态和行为所做的定义。
- **对象（object）**是运行时根据类创建的具体实例。
- **字段（field）**保存对象状态。
- **方法（method）**定义对象能够完成的行为。
- **构造器（constructor）**在 `new` 对象时建立初始状态。

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

逐段理解：

- `public final class User`：声明公开的 `User` 类；`final` 表示该类不能再被继承。
- `private final Long id`：只有 `User` 类内部可以直接访问该字段，并且引用在构造后不能重新赋值。
- `public User(...)`：构造器与类同名，没有返回值类型；调用 `new User(...)` 时执行。
- `this.id = id`：左侧 `this.id` 是当前对象的字段，右侧 `id` 是构造器参数。
- `getId()`：向外提供受控的读取方式，而不是暴露字段本身。

创建和使用对象：

```java
User alice = new User(1L, "Alice", "alice@example.com");
Long id = alice.getId();
System.out.println(id); // 1
```

运行 `new User(...)` 时可以先理解为三步：为对象准备存储、执行构造器建立状态、返回指向该对象的引用。变量 `alice` 保存的是引用值，不是把整个对象源码复制到变量中。

#### 四种访问级别

| 修饰符 | 同一个类 | 同一个 package | 子类（跨 package） | 任意代码 |
|---|---:|---:|---:|---:|
| `private` | 是 | 否 | 否 | 否 |
| package-private（不写修饰符） | 是 | 是 | 否 | 否 |
| `protected` | 是 | 是 | 受继承规则限制 | 否 |
| `public` | 是 | 是 | 是 | 是 |

第一天优先记住：字段通常保持 `private`，只公开真正需要的行为；package-private 很适合限制实现只在当前包内协作。`protected` 的跨包规则与继承有关，实际使用前应查清访问场景，不要简单理解为“比 public 小一点”。

#### `final` 修饰不同位置的含义

| 位置 | 含义 |
|---|---|
| `final class User` | 类不能被继承 |
| `final` 实例方法 | 子类不能重写该方法 |
| `final` 字段或局部变量 | 只能赋值一次 |
| `final List<String> names` | 变量不能改指向另一 List，但原 List 是否可修改取决于对象本身 |

封装不是机械生成 getter / setter，而是让对象始终保持合法状态。例如邮箱修改应经过校验，而不是允许任意 setter 写入。

```java
public void changeEmail(String newEmail) {
    if (newEmail == null || !newEmail.contains("@")) {
        throw new IllegalArgumentException("邮箱格式不正确");
    }
    this.email = newEmail.trim().toLowerCase();
}
```

上例用于说明封装思想；它要求 `email` 不是 `final`，与前面的不可变 User 是两种设计选择。不要把两个片段机械合并。

> **面试回答：封装是什么？**
> 封装不是简单地把字段设为 private 再生成所有 getter/setter，而是隐藏内部表示，通过受控行为维护对象不变量。调用者只依赖公开契约，对象自己保证状态始终合法。

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
    // 隐式为 public abstract：由实现类提供行为
    String greet(String name);

    // 实现类会继承默认实现，也可以选择重写
    default String greetGuest() {
        return format("Guest");
    }

    // 属于接口本身，通过 Greeter.isSupportedLanguage(...) 调用
    static boolean isSupportedLanguage(String language) {
        return "zh".equals(language) || "en".equals(language);
    }

    // 只供接口内部的 default 方法复用
    private String format(String name) {
        return "Welcome, " + name;
    }
}

public final class ChineseGreeter implements Greeter {
    @Override
    public String greet(String name) {
        return "你好，" + name;
    }
}

Greeter greeter = new ChineseGreeter();
System.out.println(greeter.greet("Alice"));      // 你好，Alice
System.out.println(greeter.greetGuest());        // Welcome, Guest
System.out.println(Greeter.isSupportedLanguage("zh")); // true
```

接口的四类方法要区分：

| 方法 | 谁调用 | 是否由实现类重写 |
|---|---|---|
| 抽象方法 | 通过实现对象调用 | 实现类通常必须实现 |
| `default` 方法 | 通过实现对象调用 | 可以继承或重写 |
| `static` 方法 | 通过接口名调用 | 不参与实例方法重写 |
| `private` 方法 | 仅接口内部调用 | 实现类不可见 |

TypeScript 接口主要按结构判断兼容性；Java 类通常要用 `implements` 显式建立关系。Java 接口还会保留在 class 文件和 JVM 类型系统中，因此反射与框架可以在运行时发现实现关系。

> **容易被问**：接口是不是只能声明抽象方法？不是。现代 Java 接口还能包含 `default`、`static` 和 `private` 方法，但不能像普通类那样保存每个对象各自的实例字段。

### 3.3 面向接口编程与多态

先用一个完整的小例子理解多态：

```java
interface Notifier {
    void send(String message);
}

final class ConsoleNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("控制台：" + message);
    }
}

final class EmailNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("邮件：" + message);
    }
}

static void notifyUser(Notifier notifier) {
    notifier.send("注册成功");
}

notifyUser(new ConsoleNotifier()); // 控制台：注册成功
notifyUser(new EmailNotifier());   // 邮件：注册成功
```

`notifyUser` 在编译时只依赖 `Notifier` 契约。运行时传入哪个实现对象，`notifier.send()` 就动态调用哪个实现，这叫动态分派，也是运行时多态的核心表现。

```text
编译期变量类型：Notifier
运行时实际对象：ConsoleNotifier 或 EmailNotifier
最终执行的方法：实际对象重写的 send()
```

回到用户管理案例：

```java
UserRepository repository = new InMemoryUserRepository();
UserService service = new UserService(repository);
```

`UserService` 依赖 `UserRepository` 契约，而不是依赖内存实现。未来可以新增 `JdbcUserRepository`，上层业务代码仍使用同一套契约。

这就是多态：同一个接口引用可以指向不同实现。

`UserService` 通过构造器接收依赖，而不是在内部写死 `new InMemoryUserRepository()`，这种“由外部把依赖传进来”的方式叫构造器依赖注入。Spring 后续可以自动完成对象查找和组装，但这里的设计本身不依赖 Spring。

> **面试回答：什么是多态？**
> 多态允许调用方依赖父类型或接口编程，而运行时根据实际对象执行其重写实现。它把“调用什么能力”与“能力如何实现”分开，使实现可以替换。重载是编译期选择，重写形成的动态分派才是这里所说的运行时多态。

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

```text
UserService 使用 UserRepository：has-a / uses-a，适合组合
Dog 是 Animal：is-a，才可能考虑继承
```

“组合优先”不是“禁止继承”，而是在只有代码复用需求、关系并非真正稳定的 is-a 时，不要强行建立父子类型。继承会把父类公开和受保护的行为带给子类，父类变化也更容易影响整个层次。

### 3.5 接口还是抽象类

| 问题 | 接口 | 抽象类 |
|---|---|---|
| 一个类能拥有多个吗 | 可实现多个接口 | 只能继承一个类 |
| 能否保存实例状态 | 不能保存普通实例字段 | 可以 |
| 能否有构造器 | 不能 | 可以 |
| 主要用途 | 定义能力和边界 | 共享状态、模板和部分实现 |
| 适合变化方向 | 多种类型实现同一能力 | 同一族对象共享基础实现 |

默认从接口和组合开始；只有确实需要共享状态或模板算法时再考虑抽象类。

```java
abstract class BaseImporter {
    private final String source;

    protected BaseImporter(String source) {
        this.source = source;
    }

    public final void run() {
        String content = read(source);
        save(parse(content));
    }

    protected abstract Object parse(String content);

    private String read(String source) {
        return "从 " + source + " 读取的内容";
    }

    private void save(Object value) {
        System.out.println("保存：" + value);
    }
}
```

这里抽象类同时保存 `source` 状态、提供构造器并固定 `run()` 流程，只把 `parse()` 留给子类实现，因此比“纯能力契约”更符合抽象类的用途。如果只需要表达 `parse` 能力而不共享状态和流程，接口通常更简单。

### 3.6 DTO、实体类、`record` 与 `Map`

这几个概念解决的问题不同：

| 形式 | 主要职责 | 典型特点 |
|---|---|---|
| DTO / Command | 在接口或层之间传递数据 | 结构明确，通常尽量少放业务行为 |
| Entity / 领域对象 | 表达业务身份、状态和规则 | 通常有稳定标识，并维护业务不变量 |
| `record` | 简洁声明以数据为主的载体 | 自动生成访问器、`equals()`、`hashCode()`、`toString()` |
| `Map<String, Object>` | 表达动态 Key–Value 结构 | 灵活，但稳定字段缺少编译期约束 |

```java
public record CreateUserCommand(
        String name,
        String email,
        List<String> skills
) {}
```

`record` 适合表达以数据为主的不可变载体。编译器生成构造器、访问器、`equals()`、`hashCode()` 和 `toString()`。

但它不是任何实体的默认选择：框架实体可能需要特殊构造或可变生命周期；record 字段引用不可重赋值也不代表内部可变集合被深拷贝。

```java
List<String> mutableSkills = new ArrayList<>();
mutableSkills.add("Java");

CreateUserCommand command = new CreateUserCommand(
        "Alice",
        "alice@example.com",
        mutableSkills
);

mutableSkills.add("Spring");
// 如果 record 没有防御性复制，command.skills() 也能观察到 Spring。
```

需要快照语义时，可在 record 的紧凑构造器中复制：

```java
public record CreateUserCommand(
        String name,
        String email,
        List<String> skills
) {
    public CreateUserCommand {
        skills = skills == null ? List.of() : List.copyOf(skills);
    }
}
```

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

关系图中的 `List`、`Set`、`Map` 通常是接口，`ArrayList`、`HashSet`、`HashMap` 是常用实现。声明变量时优先依赖接口，创建对象时选择实现：

```java
List<String> names = new ArrayList<>();
// 变量契约 ↑           ↑ 具体实现
```

这样调用方主要依赖“有序列表”能力，后续更换实现时影响更小。不过选用哪种实现仍然会决定顺序、性能、空值和线程安全等行为，不能完全忽略实现。

### 4.2 泛型解决什么问题

泛型允许类型把“将要处理的元素类型”作为参数。`List<String>` 可以读作“元素类型为 String 的 List”。

```java
List<String> names = new ArrayList<>();
```

逐段解释：

| 代码 | 含义 |
|---|---|
| `List` | 列表接口 |
| `<String>` | 这个列表只接受 String 元素 |
| `ArrayList` | 创建的具体列表实现 |
| `<>` | 菱形语法，编译器根据左侧推断这里也是 String |

#### 没有泛型会发生什么

没有泛型时，读取结果需要强制转换，错误可能延迟到运行时：

```java
List values = new ArrayList();
values.add("Java");
values.add(21);
String name = (String) values.get(1); // ClassCastException
```

这里的 `List` 没有类型参数，叫原始类型（raw type）。编译器通常会给出警告，但它仍允许把 String 和 Integer 混在一起，直到错误的强制转换在运行时失败。

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

“类型擦除”不等于泛型没有价值：它已经在编译期阻止了错误元素进入，并让读取结果不需要由业务代码手写强制转换。它也带来一些限制，例如不能直接写：

```java
// if (value instanceof List<String>) {} // 不能这样检查运行时元素参数
// T value = new T();                    // 一般不能直接 new 类型参数
```

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

为什么不能赋值？假设允许下面的操作：

```java
// List<String> names = new ArrayList<>();
// List<Object> objects = names;
// objects.add(123); // 如果允许，就把 Integer 放进了“只装 String”的列表
```

因此 Java 泛型默认是不变的：即使 `String` 是 `Object` 的子类型，`List<String>` 也不是 `List<Object>` 的子类型。`List<?>` 表示“元素具体类型未知的 List”，适合只遍历为 Object 的场景，但不能随意加入非 null 元素。

`? extends T`、`? super T` 和 PECS 属于后续泛型进阶。第一天只需知道它们用于在“类型安全”和“接受不同泛型实参”之间建立边界，不要求立刻背诵复杂规则。

> **面试回答：泛型解决什么问题？**
> 泛型把元素或返回值类型参数化，让编译器在编译期检查类型，减少运行时强制转换和 `ClassCastException`。Java 泛型主要通过类型擦除实现，所以部分类型参数运行时不可直接判断；同时泛型默认不具备协变关系，`List<String>` 不是 `List<Object>`。

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

#### 先理解复杂度符号

复杂度描述的是输入规模 `n` 增长时，操作成本的增长趋势，不是某次操作精确花费的毫秒数：

| 记号 | 直观含义 | 例子 |
|---|---|---|
| O(1) | 数据变多时，核心步骤数量基本不随 n 增长 | ArrayList 按索引读取 |
| O(log n) | 每一步排除大量候选，增长较慢 | TreeMap 查询 |
| O(n) | 最坏情况下需要检查或移动与 n 同数量级的元素 | List 线性查找 |
| 摊销 O(1) | 偶尔一次很慢，但把多次操作平均后接近常数 | ArrayList 尾部追加与偶发扩容 |

例如 ArrayList 扩容时需要复制已有元素，某一次 `add` 可能是 O(n)，但并非每次都扩容，因此连续多次尾部添加通常按摊销 O(1) 描述。

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
Map<Long, String> userNames = new HashMap<>();
userNames.put(1L, "Alice");

String found = userNames.get(1L);   // Alice
String missing = userNames.get(99L); // null
```

如果需要区分“Key 不存在”和“Key 存在但 Value 为 null”，使用 `containsKey`。业务 Repository 也可返回 `Optional<User>`，避免把 null 语义传播到上层。

| 实现 | 特征 |
|---|---|
| `HashMap` | 平均 O(1) 查找；不保证迭代顺序 |
| `LinkedHashMap` | 保留插入顺序或访问顺序 |
| `TreeMap` | 按 Key 排序，典型操作 O(log n) |

`HashMap` 允许一个 null Key 和多个 null Value，但工程代码应按 API 契约谨慎使用。

### 4.6 `equals()` 与 `hashCode()` 契约

先看一个没有重写二者的反例：

```java
final class Skill {
    private final String name;

    Skill(String name) {
        this.name = name;
    }
}

Set<Skill> skills = new HashSet<>();
skills.add(new Skill("Java"));
skills.add(new Skill("Java"));
System.out.println(skills.size()); // 2
```

两个对象虽然字段内容相同，但默认 `Object.equals()` 按对象身份判断，它们是两个不同实例，所以不会自动去重。

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

HashSet 判断候选元素是否重复时，可以先建立以下简化模型：

```text
调用 hashCode() 定位候选区域
          ↓
存在相同哈希的候选对象
          ↓
再调用 equals() 判断业务上是否相等
```

哈希相同只代表“可能相等”，因为哈希冲突合法；`equals()` 为 true 的两个对象却必须返回相同哈希，否则哈希集合可能先把它们分到不同候选区域，破坏查询和去重行为。

如果对象放入 HashSet 后修改了参与哈希的字段，后续 `contains` 可能失败。Hash Key 应优先使用不可变值，如 `String`、`Long`、UUID 或设计正确的 record。

> **面试回答：为什么重写 equals 还要重写 hashCode？**
> HashSet 和 HashMap 先用 hashCode 缩小候选范围，再用 equals 判断逻辑相等。契约要求 equals 相等的对象必须拥有相同 hashCode；如果只重写 equals，同一业务对象可能进入不同哈希位置，导致重复、查询或删除失败。哈希相同不要求 equals 相等，因为冲突是允许的。

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

### 5.4 阅读完整案例前需要认识的最小语法

完整案例刻意保持纯 Java，但仍会出现几个前面没有展开的标准写法。这里的目标是“先能读懂”，深入使用放到后续课程。

#### `@Override`

```java
@Override
public User save(User user) {
    // ...
}
```

`@Override` 告诉编译器：这个方法应该重写父类或实现接口中的方法。如果方法名或参数写错，编译器会尽早报错。它不是“让重写生效的开关”，而是可校验的声明。

#### `Optional<T>`

```java
Optional<User> findById(Long id);
```

`Optional<User>` 表示结果中可能有一个 User，也可能没有，适合表达查询返回值的缺失情况：

```java
return repository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("用户不存在: " + id));
```

可先读作：“找到就返回 User；没有就根据右侧规则创建并抛出异常。”不要把 Optional 机械用于所有字段和参数。

#### Lambda、Stream 和方法引用

仓储中有下面的代码：

```java
return users.values().stream()
        .anyMatch(user -> user.getEmail().equalsIgnoreCase(email));
```

- `stream()`：建立对元素序列进行流水线处理的入口。
- `user -> 条件`：Lambda，表示“给我一个 user，计算右侧条件”。
- `anyMatch(...)`：只要有一个元素满足条件就返回 true。

它与下面的普通循环表达相同的核心意图：

```java
for (User user : users.values()) {
    if (user.getEmail().equalsIgnoreCase(email)) {
        return true;
    }
}
return false;
```

启动类中的方法引用：

```java
service.listAll().forEach(System.out::println);
```

在这个场景可以近似理解为：

```java
service.listAll().forEach(user -> System.out.println(user));
```

再展开成普通循环就是：

```java
for (User user : service.listAll()) {
    System.out.println(user);
}
```

第一天只需要能完成这三种写法的互相阅读，不要求掌握 Stream 的全部操作。

#### 抛出异常与捕获异常

```java
if (name == null || name.isBlank()) {
    throw new IllegalArgumentException("name 不能为空");
}
```

`throw` 立即结束当前正常流程，把错误交给调用者。调用者可以选择捕获：

```java
try {
    service.create("", "alice@example.com", List.of());
} catch (IllegalArgumentException exception) {
    System.out.println(exception.getMessage());
}
```

`try` 放可能失败的操作，`catch` 处理指定异常。完整的异常分类、自定义异常和统一错误处理留到后续课程。

### 5.5 关键实现讲解

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

### 5.6 一次创建操作怎样流过系统

执行下面的调用：

```java
User alice = service.create(
        " Alice ",
        "ALICE@example.com",
        List.of("Java", "TypeScript", "Java", " ")
);
```

程序会依次经过：

```text
App.main()
  │ 传入原始输入
  ▼
UserService.create()
  ├─ 清理姓名：" Alice " → "Alice"
  ├─ 标准化邮箱："ALICE@example.com" → "alice@example.com"
  ├─ 调 Repository 检查邮箱唯一性
  ├─ 技能过滤、trim、去重并保留顺序
  └─ 创建尚无 ID 的 User
          │
          ▼
UserRepository.save() 契约
          │ 运行时实现
          ▼
InMemoryUserRepository.save()
  ├─ 分配 ID
  ├─ 保存到 LinkedHashMap<Long, User>
  └─ 返回带 ID 的 User
          │
          ▼
UserService 把结果返回 App，变量 alice 保存该对象引用
```

这里最重要的不是记住文件名，而是理解职责边界：App 负责发起用例和展示，Service 负责业务规则，Repository 定义存取契约，内存实现负责具体集合操作，User 表达业务数据。

> **现场演示**：在 `App.main()`、`UserService.create()` 和 `InMemoryUserRepository.save()` 各设一个断点，使用 Step Into 跟踪同一次调用。观察原始参数、标准化后的局部变量、分配 ID 前后的 User，以及 Map 中新增的条目。

### 5.7 预期运行结果

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

> 本节按真实面试答题方式组织：先直接回答，再结合项目说明原理与边界，最后承接连续追问。不要逐字死背，应理解后用自己的语气表达。

### Q01. JDK、JRE、JVM 是什么关系？

**面试官提问**

> JDK、JRE、JVM 是什么关系？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：JVM 负责加载和执行字节码；JRE 是 JVM 加运行 Java 程序所需的类库与组件；JDK 在运行能力之上增加 `javac`、`jar`、`javadoc` 等开发工具。开发环境直接安装 JDK 21 即可。

三者是职责层次，而不是三个必须分别安装的程序。现代 JDK 的模块化发行方式与早期独立 JRE 安装包不同，但“JVM 执行、运行环境提供组件、JDK 提供开发工具”的概念仍然有用。

源码、字节码和运行时是三个阶段：编译器负责静态检查与生成 class，JVM 负责加载、验证和执行，热点代码还可能由 JIT 编译成本机码。在当前学习项目里，我会用 Day1 的 App.java 演示完整链路：先由 javac 生成 class 字节码，再由 java 启动 JVM 加载并执行；同时明确路径、编码和本地库仍可能带来平台差异。我还会主动说明适用边界：跨平台依赖兼容 JVM 和不使用平台特性；JIT、对象布局等属于 JVM 实现行为，不能当作 Java 语言规范承诺。

**结合当天项目**

我会用 Day1 的 App.java 演示完整链路：先由 javac 生成 class 字节码，再由 java 启动 JVM 加载并执行；同时明确路径、编码和本地库仍可能带来平台差异。

**原理与边界**

源码、字节码和运行时是三个阶段：编译器负责静态检查与生成 class，JVM 负责加载、验证和执行，热点代码还可能由 JIT 编译成本机码。 跨平台依赖兼容 JVM 和不使用平台特性；JIT、对象布局等属于 JVM 实现行为，不能当作 Java 语言规范承诺。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用 Day1 的 App.java 演示完整链路：先由 javac 生成 class 字节码，再由 java 启动 JVM 加载并执行；同时明确路径、编码和本地库仍可能带来平台差异。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 跨平台依赖兼容 JVM 和不使用平台特性；JIT、对象布局等属于 JVM 实现行为，不能当作 Java 语言规范承诺。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> JVM 负责加载和执行字节码；JRE 是 JVM 加运行 Java 程序所需的类库与组件；JDK 在运行能力之上增加 `javac`、`jar`、`javadoc` 等开发工具。开发环境直接安装 JDK 21 即可。真正落地时还要结合调用契约和运行边界验证。

---

### Q02. Java 是编译型还是解释型？

**面试官提问**

> Java 是编译型还是解释型？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不能只用“编译型”或“解释型”二选一描述 Java。源码先由 `javac` 编译为字节码；JVM 运行时既可以解释字节码，也可以把热点代码通过 JIT 编译为本机机器码。

提前编译提供类型检查和跨 JVM 的中间表示，运行时优化又能根据真实执行情况优化热点路径。因此“Java 源码直接由 JVM 逐行解释”是不准确的。

源码、字节码和运行时是三个阶段：编译器负责静态检查与生成 class，JVM 负责加载、验证和执行，热点代码还可能由 JIT 编译成本机码。在当前学习项目里，我会用 Day1 的 App.java 演示完整链路：先由 javac 生成 class 字节码，再由 java 启动 JVM 加载并执行；同时明确路径、编码和本地库仍可能带来平台差异。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会用 Day1 的 App.java 演示完整链路：先由 javac 生成 class 字节码，再由 java 启动 JVM 加载并执行；同时明确路径、编码和本地库仍可能带来平台差异。

**原理与边界**

源码、字节码和运行时是三个阶段：编译器负责静态检查与生成 class，JVM 负责加载、验证和执行，热点代码还可能由 JIT 编译成本机码。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用 Day1 的 App.java 演示完整链路：先由 javac 生成 class 字节码，再由 java 启动 JVM 加载并执行；同时明确路径、编码和本地库仍可能带来平台差异。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不能只用“编译型”或“解释型”二选一描述 Java。源码先由 `javac` 编译为字节码；JVM 运行时既可以解释字节码，也可以把热点代码通过 JIT 编译为本机机器码。真正落地时还要结合调用契约和运行边界验证。

---

### Q03. 字节码为什么能跨平台？

**面试官提问**

> 字节码为什么能跨平台？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：Java 编译器生成面向 JVM 规范的字节码，不直接绑定某一种 CPU 指令；Windows、macOS、Linux 上各自的 JVM 负责把它执行为适合当前平台的形式。

“一次编译，到处运行”有边界：本地动态库、操作系统命令、文件路径、权限、默认编码、时区和硬件能力都可能产生平台差异。所以更准确的说法是“符合相同 Java 与 JVM 规范、且不依赖平台特性的构件通常可以跨平台运行”。

`target/day1-user-management-1.0.0.jar` 不包含平台相关代码时，可以交给其他已安装兼容 JDK 的系统运行。

源码、字节码和运行时是三个阶段：编译器负责静态检查与生成 class，JVM 负责加载、验证和执行，热点代码还可能由 JIT 编译成本机码。在当前学习项目里，我会用 Day1 的 App.java 演示完整链路：先由 javac 生成 class 字节码，再由 java 启动 JVM 加载并执行；同时明确路径、编码和本地库仍可能带来平台差异。我还会主动说明适用边界：跨平台依赖兼容 JVM 和不使用平台特性；JIT、对象布局等属于 JVM 实现行为，不能当作 Java 语言规范承诺。

**结合当天项目**

我会用 Day1 的 App.java 演示完整链路：先由 javac 生成 class 字节码，再由 java 启动 JVM 加载并执行；同时明确路径、编码和本地库仍可能带来平台差异。

**原理与边界**

源码、字节码和运行时是三个阶段：编译器负责静态检查与生成 class，JVM 负责加载、验证和执行，热点代码还可能由 JIT 编译成本机码。 跨平台依赖兼容 JVM 和不使用平台特性；JIT、对象布局等属于 JVM 实现行为，不能当作 Java 语言规范承诺。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用 Day1 的 App.java 演示完整链路：先由 javac 生成 class 字节码，再由 java 启动 JVM 加载并执行；同时明确路径、编码和本地库仍可能带来平台差异。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 跨平台依赖兼容 JVM 和不使用平台特性；JIT、对象布局等属于 JVM 实现行为，不能当作 Java 语言规范承诺。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> Java 编译器生成面向 JVM 规范的字节码，不直接绑定某一种 CPU 指令；Windows、macOS、Linux 上各自的 JVM 负责把它执行为适合当前平台的形式。真正落地时还要结合调用契约和运行边界验证。

---

### Q04. `main` 为什么是 `public static void`？

**面试官提问**

> `main` 为什么是 `public static void`？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：这是 Java 启动器识别普通应用入口的约定。

- `public`：启动器能够访问；
- `static`：不需要先创建启动类对象；
- `void`：不向 JVM 调用者返回 Java 值；
- `main`：约定的方法名；
- `String[] args`：接收命令行参数。

`void` 不等于进程永远返回成功；进程退出码可以通过正常结束或 `System.exit(code)` 等方式体现。测试、Servlet 容器和 Spring Boot 还可能有各自的启动与回调流程。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 这是 Java 启动器识别普通应用入口的约定。真正落地时还要结合调用契约和运行边界验证。

---

### Q05. public 类名为什么与文件名一致？

**面试官提问**

> public 类名为什么与文件名一致？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：使用常见文件系统源码组织和 `javac` 时，`public` 顶级类型需要能通过源文件名定位，因此 `public class User` 通常位于 `User.java`。一个源文件只能有一个与文件名对应的 public 顶级类型，但可以有其他非 public 顶级类型。

这个规则只针对顶级 public 类型；内部类不需要各自占一个同名源文件。它也不是说“一个 Java 文件只能写一个类”。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 使用常见文件系统源码组织和 `javac` 时，`public` 顶级类型需要能通过源文件名定位，因此 `public class User` 通常位于 `User.java`。一个源文件只能有一个与文件名对应的 public 顶级类型，但可以有其他非 public 顶级类型。真正落地时还要结合调用契约和运行边界验证。

---

### Q06. Java 是不是万物皆对象？

**面试官提问**

> Java 是不是万物皆对象？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不是。Java 大量通过类和对象组织程序，但语言保留了 `byte`、`short`、`int`、`long`、`float`、`double`、`char`、`boolean` 八种基本类型。

基本类型不能为 null，也不能直接作为泛型参数；对应包装类让基本值进入对象 API 和集合。不要进一步推导为“基本类型一定在栈、包装类一定在堆”，这不是 Java 语言规范保证的简单对应关系。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不是。Java 大量通过类和对象组织程序，但语言保留了 `byte`、`short`、`int`、`long`、`float`、`double`、`char`、`boolean` 八种基本类型。真正落地时还要结合调用契约和运行边界验证。

---

### Q07. 为什么局部变量没有默认值？

**面试官提问**

> 为什么局部变量没有默认值？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：字段和数组元素由 Java 初始化规则赋默认值；局部变量必须在读取前经过编译器能够确认的明确赋值。

```java
int local;
// System.out.println(local); // 编译错误

int[] values = new int[1];
System.out.println(values[0]); // 0
```

这样能在编译期发现局部流程遗漏，而不是默默把本应计算出来的值当成 0。包装类字段的默认值是 null，不是其对应基本类型的 0 或 false。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，用户尚未保存时 ID 可以用 Long 表达缺失，而循环计数和页大小用 int；这样能同时说明可空语义、泛型限制、拆箱风险和数值边界。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

用户尚未保存时 ID 可以用 Long 表达缺失，而循环计数和页大小用 int；这样能同时说明可空语义、泛型限制、拆箱风险和数值边界。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 用户尚未保存时 ID 可以用 Long 表达缺失，而循环计数和页大小用 int；这样能同时说明可空语义、泛型限制、拆箱风险和数值边界。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 字段和数组元素由 Java 初始化规则赋默认值；局部变量必须在读取前经过编译器能够确认的明确赋值。真正落地时还要结合调用契约和运行边界验证。

---

### Q08. `int` 和 `Integer` 怎么选？

**面试官提问**

> `int` 和 `Integer` 怎么选？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：值一定存在并用于计算时通常优先 `int`；需要表达缺失、用于泛型集合或调用对象 API 时使用 `Integer`。

二者可自动装箱和拆箱，但 `Integer value = null; int n = value;` 会在拆箱时抛出 `NullPointerException`。包装类的 `==` 比较引用并可能受到缓存影响，内容比较使用 `equals()`，存在 null 时使用 `Objects.equals()`。

用户尚未保存时 ID 可能缺失，可以使用 `Long id = null`；已经明确存在的循环计数通常用 `int`。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，用户尚未保存时 ID 可以用 Long 表达缺失，而循环计数和页大小用 int；这样能同时说明可空语义、泛型限制、拆箱风险和数值边界。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

用户尚未保存时 ID 可以用 Long 表达缺失，而循环计数和页大小用 int；这样能同时说明可空语义、泛型限制、拆箱风险和数值边界。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 用户尚未保存时 ID 可以用 Long 表达缺失，而循环计数和页大小用 int；这样能同时说明可空语义、泛型限制、拆箱风险和数值边界。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 值一定存在并用于计算时通常优先 `int`；需要表达缺失、用于泛型集合或调用对象 API 时使用 `Integer`。真正落地时还要结合调用契约和运行边界验证。

---

### Q09. `String` 为什么不可变？

**面试官提问**

> `String` 为什么不可变？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：String 对象创建后字符序列不能修改，任何看似修改的操作都会返回新字符串。不可变便于安全共享、字符串池复用、哈希值稳定和作为 Map Key，也降低跨 API 与多线程只读共享时的风险。

```java
String value = "java";
String upper = value.toUpperCase();
System.out.println(value); // java
System.out.println(upper); // JAVA
```

不可变的是对象内容，不是变量；变量仍可重新指向其他 String。循环中大量 `+` 拼接可能产生许多中间对象，通常使用 `StringBuilder`。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，用户邮箱、姓名等内容比较使用 equals 或 Objects.equals，不能利用字符串池偶然造成的引用相同；标准化后的新字符串也不会修改原对象。我还会主动说明适用边界：final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**结合当天项目**

用户邮箱、姓名等内容比较使用 equals 或 Objects.equals，不能利用字符串池偶然造成的引用相同；标准化后的新字符串也不会修改原对象。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 用户邮箱、姓名等内容比较使用 equals 或 Objects.equals，不能利用字符串池偶然造成的引用相同；标准化后的新字符串也不会修改原对象。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> String 对象创建后字符序列不能修改，任何看似修改的操作都会返回新字符串。不可变便于安全共享、字符串池复用、哈希值稳定和作为 Map Key，也降低跨 API 与多线程只读共享时的风险。真正落地时还要结合调用契约和运行边界验证。

---

### Q10. `==` 和 `equals()` 怎么选？

**面试官提问**

> `==` 和 `equals()` 怎么选？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：基本类型的 `==` 比较基本值；引用类型的 `==` 比较两个引用是否指向同一对象；`equals()` 用于表达由类定义的内容或业务相等。

```java
String a = new String("Java");
String b = new String("Java");
System.out.println(a == b);      // false
System.out.println(a.equals(b)); // true
```

如果类没有重写 `equals()`，继承自 Object 的默认行为通常仍是身份比较。调用方可能出现 null 时使用 `Objects.equals(a, b)`，避免在 null 上调用实例方法。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，用户邮箱、姓名等内容比较使用 equals 或 Objects.equals，不能利用字符串池偶然造成的引用相同；标准化后的新字符串也不会修改原对象。我还会主动说明适用边界：只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。

**结合当天项目**

用户邮箱、姓名等内容比较使用 equals 或 Objects.equals，不能利用字符串池偶然造成的引用相同；标准化后的新字符串也不会修改原对象。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 用户邮箱、姓名等内容比较使用 equals 或 Objects.equals，不能利用字符串池偶然造成的引用相同；标准化后的新字符串也不会修改原对象。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 基本类型的 `==` 比较基本值；引用类型的 `==` 比较两个引用是否指向同一对象；`equals()` 用于表达由类定义的内容或业务相等。真正落地时还要结合调用契约和运行边界验证。

---

### Q11. Java 是值传递还是引用传递？

**面试官提问**

> Java 是值传递还是引用传递？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：Java 始终按值传递。基本类型传递基本值的副本；引用类型传递引用值的副本。

引用副本与调用方引用可以指向同一个可变对象，所以方法内 `list.add(...)` 会被调用方观察到；但方法内执行 `list = new ArrayList<>()` 只改变参数副本，不会让调用方变量改指向新对象。

如果 Java 真是“引用变量本身按引用传递”，被调用方法就应能够直接替换调用方变量指向，但它做不到。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用 UserService 的创建和更新方法说明参数、返回值与重载，并用 List 参数演示：方法能修改共享对象，但不能替换调用方变量本身。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会用 UserService 的创建和更新方法说明参数、返回值与重载，并用 List 参数演示：方法能修改共享对象，但不能替换调用方变量本身。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用 UserService 的创建和更新方法说明参数、返回值与重载，并用 List 参数演示：方法能修改共享对象，但不能替换调用方变量本身。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> Java 始终按值传递。基本类型传递基本值的副本；引用类型传递引用值的副本。真正落地时还要结合调用契约和运行边界验证。

---

### Q12. `static` 是什么？

**面试官提问**

> `static` 是什么？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：`static` 成员属于类型层面，不依赖某个具体对象；实例成员属于对象，每个对象可以拥有不同状态。

静态方法没有特定对象的 `this`，因此不能直接读取实例字段。它适合入口、常量、无实例状态的纯工具和工厂方法；需要对象状态、多态替换或依赖注入的业务行为通常使用实例方法。

静态方法不会像实例方法那样形成运行时动态分派；子类声明同签名静态方法属于隐藏，而不是重写。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用 UserService 的创建和更新方法说明参数、返回值与重载，并用 List 参数演示：方法能修改共享对象，但不能替换调用方变量本身。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会用 UserService 的创建和更新方法说明参数、返回值与重载，并用 List 参数演示：方法能修改共享对象，但不能替换调用方变量本身。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用 UserService 的创建和更新方法说明参数、返回值与重载，并用 List 参数演示：方法能修改共享对象，但不能替换调用方变量本身。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> `static` 成员属于类型层面，不依赖某个具体对象；实例成员属于对象，每个对象可以拥有不同状态。真正落地时还要结合调用契约和运行边界验证。

---

### Q13. 重载和重写有什么区别？

**面试官提问**

> 重载和重写有什么区别？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：重载发生在同一个类型的同名方法之间，参数列表不同，编译器在编译期选择；重写发生在继承或接口实现关系中，子类或实现类为已有实例方法提供新实现，运行时根据实际对象动态分派。

```java
add(int a, int b);     // 重载版本一
add(long a, long b);   // 重载版本二

class ConsoleNotifier implements Notifier {
    @Override
    public void send(String message) { /* 重写 */ }
}
```

重载不能只改变返回类型。重写需要兼容原方法参数和返回契约，不能缩小可见性；`@Override` 可以帮助编译器检查。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用 UserService 的创建和更新方法说明参数、返回值与重载，并用 List 参数演示：方法能修改共享对象，但不能替换调用方变量本身。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会用 UserService 的创建和更新方法说明参数、返回值与重载，并用 List 参数演示：方法能修改共享对象，但不能替换调用方变量本身。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用 UserService 的创建和更新方法说明参数、返回值与重载，并用 List 参数演示：方法能修改共享对象，但不能替换调用方变量本身。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 重载发生在同一个类型的同名方法之间，参数列表不同，编译器在编译期选择；重写发生在继承或接口实现关系中，子类或实现类为已有实例方法提供新实现，运行时根据实际对象动态分派。真正落地时还要结合调用契约和运行边界验证。

---

### Q14. Java 接口为什么运行时还存在？

**面试官提问**

> Java 接口为什么运行时还存在？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：Java 接口会编译为 class 文件中的类型信息，JVM 用它检查类型关系和方法调用，反射及框架也能在运行时读取接口和实现关系。TypeScript `interface` 主要用于编译期结构检查，生成 JavaScript 后通常不再作为运行时对象存在。

这也是为什么 Spring 等框架能够在运行时查找某个 Java 接口的实现，而不能直接靠已被擦除的 TypeScript 接口完成同样的运行时发现。

**边界**：Java 泛型参数仍可能发生类型擦除，不能把“接口类型存在”误解为“所有泛型细节都完整保留”。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> Java 接口会编译为 class 文件中的类型信息，JVM 用它检查类型关系和方法调用，反射及框架也能在运行时读取接口和实现关系。TypeScript `interface` 主要用于编译期结构检查，生成 JavaScript 后通常不再作为运行时对象存在。真正落地时还要结合调用契约和运行边界验证。

---

### Q15. 接口和抽象类怎么选？

**面试官提问**

> 接口和抽象类怎么选？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：定义能力、依赖边界和多种实现时优先接口；多个同族对象确实需要共享实例状态、构造流程或模板算法时考虑抽象类。

一个类可以实现多个接口，但只能继承一个类。接口可有 default、static 和 private 方法，却不能保存每个实现对象独立的普通实例字段；抽象类可以有字段、构造器、具体方法和抽象方法。

`UserRepository` 只定义存取契约，适合接口；如果多个导入器需要共享数据源字段并固定“读取—解析—保存”模板流程，抽象类可能更合适。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 定义能力、依赖边界和多种实现时优先接口；多个同族对象确实需要共享实例状态、构造流程或模板算法时考虑抽象类。真正落地时还要结合调用契约和运行边界验证。

---

### Q16. 为什么默认推荐 ArrayList？

**面试官提问**

> 为什么默认推荐 ArrayList？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：通用列表默认优先 ArrayList，因为按索引读取为 O(1)，尾部添加为摊销 O(1)，内存局部性通常较好，并且实际业务常以遍历和尾部追加为主。

LinkedList 按索引定位是 O(n)；只有已经持有目标节点或迭代器位置时，链接插入和删除本身才是 O(1)。它还为每个节点保存前后引用，额外开销更高。队列或栈通常优先 ArrayDeque。

**边界**：这是合理默认值，不是“永远最快”。最终应根据操作模式、数据规模和测量结果决定。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 通用列表默认优先 ArrayList，因为按索引读取为 O(1)，尾部添加为摊销 O(1)，内存局部性通常较好，并且实际业务常以遍历和尾部追加为主。真正落地时还要结合调用契约和运行边界验证。

---

### Q17. Set 是不是无序？

**面试官提问**

> Set 是不是无序？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不能把 Set 接口直接定义为“无序集合”。Set 的核心契约是元素不重复且不提供按索引访问；迭代顺序由具体实现决定。

- `HashSet` 不保证迭代顺序；
- `LinkedHashSet` 通常保留插入顺序；
- `TreeSet` 按自然顺序或 Comparator 排序。

技能要去重并保留用户首次输入顺序，所以案例选择 LinkedHashSet，而不是依赖 HashSet 某次运行“看起来稳定”的输出。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。我还会主动说明适用边界：只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。

**结合当天项目**

我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不能把 Set 接口直接定义为“无序集合”。Set 的核心契约是元素不重复且不提供按索引访问；迭代顺序由具体实现决定。真正落地时还要结合调用契约和运行边界验证。

---

### Q18. HashSet 如何判断重复？

**面试官提问**

> HashSet 如何判断重复？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：HashSet 在 JDK 中基于 HashMap 实现，可建立“先用 `hashCode()` 定位候选区域，再用 `equals()` 判断逻辑相等”的简化模型。

哈希值相同只表示可能处于同一候选区域，因为哈希冲突合法；最终是否重复还要看 equals。equals 为 true 的对象必须返回相同 hashCode，否则集合可能无法把它们放到同一候选范围。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。我还会主动说明适用边界：只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。

**结合当天项目**

我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> HashSet 在 JDK 中基于 HashMap 实现，可建立“先用 `hashCode()` 定位候选区域，再用 `equals()` 判断逻辑相等”的简化模型。真正落地时还要结合调用契约和运行边界验证。

---

### Q19. 为什么重写 equals 还要重写 hashCode？

**面试官提问**

> 为什么重写 equals 还要重写 hashCode？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：因为 HashSet 和 HashMap 的查找流程同时依赖二者。Java 契约要求 equals 相等的对象必须拥有相同 hashCode；只重写 equals 会让逻辑相等对象可能进入不同哈希位置，导致重复、查询或删除异常。

反方向不成立：hashCode 相同的对象可以不相等，因为有限整数哈希无法保证没有冲突。

**工程规则**：用于 equals 的字段通常也应参与 hashCode；IDE 或 record 可以帮助生成，但相等依据仍需根据业务身份设计，不能机械选中所有字段。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，用户邮箱、姓名等内容比较使用 equals 或 Objects.equals，不能利用字符串池偶然造成的引用相同；标准化后的新字符串也不会修改原对象。我还会主动说明适用边界：只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。

**结合当天项目**

用户邮箱、姓名等内容比较使用 equals 或 Objects.equals，不能利用字符串池偶然造成的引用相同；标准化后的新字符串也不会修改原对象。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 用户邮箱、姓名等内容比较使用 equals 或 Objects.equals，不能利用字符串池偶然造成的引用相同；标准化后的新字符串也不会修改原对象。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 因为 HashSet 和 HashMap 的查找流程同时依赖二者。Java 契约要求 equals 相等的对象必须拥有相同 hashCode；只重写 equals 会让逻辑相等对象可能进入不同哈希位置，导致重复、查询或删除异常。真正落地时还要结合调用契约和运行边界验证。

---

### Q20. 为什么 Map 的 Key 最好不可变？

**面试官提问**

> 为什么 Map 的 Key 最好不可变？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：哈希 Map 在插入时根据 Key 当时的 hashCode 放置条目；如果之后修改了参与 equals/hashCode 的字段，再查询时会按新哈希寻找，可能无法到达原位置。

即使遍历 Map 时还能看到该条目，`get(key)`、`containsKey(key)` 或 `remove(key)` 也可能失败。这不是 Map 随机丢数据，而是 Key 破坏了插入期间必须稳定的哈希契约。

**推荐**：优先使用 String、Long、UUID、不可变 record 或专门设计的不可变键对象。

集合类型表达不同的数据语义：List 关注顺序和重复，Set 关注唯一性，Map 关注键到值的映射；具体实现还会带来顺序、空值、复杂度和线程安全差异。在当前学习项目里，用户输入和输出有稳定字段时使用 DTO 或 record，领域 User 保护业务状态；只有动态扩展字段、临时聚合等边界场景才考虑 Map。我还会主动说明适用边界：final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**结合当天项目**

用户输入和输出有稳定字段时使用 DTO 或 record，领域 User 保护业务状态；只有动态扩展字段、临时聚合等边界场景才考虑 Map。

**原理与边界**

集合类型表达不同的数据语义：List 关注顺序和重复，Set 关注唯一性，Map 关注键到值的映射；具体实现还会带来顺序、空值、复杂度和线程安全差异。 final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 用户输入和输出有稳定字段时使用 DTO 或 record，领域 User 保护业务状态；只有动态扩展字段、临时聚合等边界场景才考虑 Map。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 哈希 Map 在插入时根据 Key 当时的 hashCode 放置条目；如果之后修改了参与 equals/hashCode 的字段，再查询时会按新哈希寻找，可能无法到达原位置。真正落地时还要结合调用契约和运行边界验证。

---

### Q21. 为什么 `List<int>` 不合法？

**面试官提问**

> 为什么 `List<int>` 不合法？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：Java 泛型类型参数必须是引用类型，`int` 是基本类型，所以不能写 `List<int>`；应写 `List<Integer>`，编译器在加入和读取时协助自动装箱与拆箱。

```java
List<Integer> scores = new ArrayList<>();
scores.add(100);       // int 自动装箱为 Integer
int score = scores.get(0); // Integer 自动拆箱为 int
```

需要注意额外对象语义、比较方式和 null 拆箱风险。未来 Java 可能继续演进泛型与值对象能力，但 JDK 21 中应遵守上述规则。

泛型在编译期建立参数化类型约束；Java 泛型默认不变，通配符表达未知类型的读写边界，类型擦除不等于泛型没有作用。在当前学习项目里，用户尚未保存时 ID 可以用 Long 表达缺失，而循环计数和页大小用 int；这样能同时说明可空语义、泛型限制、拆箱风险和数值边界。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

用户尚未保存时 ID 可以用 Long 表达缺失，而循环计数和页大小用 int；这样能同时说明可空语义、泛型限制、拆箱风险和数值边界。

**原理与边界**

泛型在编译期建立参数化类型约束；Java 泛型默认不变，通配符表达未知类型的读写边界，类型擦除不等于泛型没有作用。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 用户尚未保存时 ID 可以用 Long 表达缺失，而循环计数和页大小用 int；这样能同时说明可空语义、泛型限制、拆箱风险和数值边界。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> Java 泛型类型参数必须是引用类型，`int` 是基本类型，所以不能写 `List<int>`；应写 `List<Integer>`，编译器在加入和读取时协助自动装箱与拆箱。真正落地时还要结合调用契约和运行边界验证。

---

### Q22. `HashMap` 线程安全吗？

**面试官提问**

> `HashMap` 线程安全吗？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：HashMap 不保证多线程共享修改的安全性。并发读写需要明确所有权、同步策略或合适的并发集合，不能只凭“本地测试没出错”判断安全。

ConcurrentHashMap 能为其单次操作提供并发语义，但“先检查再写入”等多个操作组合不一定自动成为一个业务原子操作，应使用 `computeIfAbsent` 等原子 API 或更高层协调。

```java
// 两步组合在并发下可能发生竞争
if (!map.containsKey(key)) {
    map.put(key, value);
}
```

**课程边界**：Day1 只要求知道常用集合默认不保证线程安全，线程模型和并发控制留到后续专题。

集合类型表达不同的数据语义：List 关注顺序和重复，Set 关注唯一性，Map 关注键到值的映射；具体实现还会带来顺序、空值、复杂度和线程安全差异。在当前学习项目里，用户输入和输出有稳定字段时使用 DTO 或 record，领域 User 保护业务状态；只有动态扩展字段、临时聚合等边界场景才考虑 Map。我还会主动说明适用边界：复杂度描述随规模增长的趋势；HashMap 的 O(1) 通常是平均情况，常数、冲突、缓存和数据规模会影响实际表现。

**结合当天项目**

用户输入和输出有稳定字段时使用 DTO 或 record，领域 User 保护业务状态；只有动态扩展字段、临时聚合等边界场景才考虑 Map。

**原理与边界**

集合类型表达不同的数据语义：List 关注顺序和重复，Set 关注唯一性，Map 关注键到值的映射；具体实现还会带来顺序、空值、复杂度和线程安全差异。 复杂度描述随规模增长的趋势；HashMap 的 O(1) 通常是平均情况，常数、冲突、缓存和数据规模会影响实际表现。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 用户输入和输出有稳定字段时使用 DTO 或 record，领域 User 保护业务状态；只有动态扩展字段、临时聚合等边界场景才考虑 Map。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 复杂度描述随规模增长的趋势；HashMap 的 O(1) 通常是平均情况，常数、冲突、缓存和数据规模会影响实际表现。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> HashMap 不保证多线程共享修改的安全性。并发读写需要明确所有权、同步策略或合适的并发集合，不能只凭“本地测试没出错”判断安全。真正落地时还要结合调用契约和运行边界验证。

---

### Q23. `List.of` 与 `new ArrayList<>()` 有什么区别？

**面试官提问**

> `List.of` 与 `new ArrayList<>()` 有什么区别？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：`List.of(...)` 创建不可修改且拒绝 null 的列表；`new ArrayList<>()` 创建可增删列表。

```java
List<String> fixed = List.of("Java", "Spring");
// fixed.add("Agent"); // UnsupportedOperationException

List<String> mutable = new ArrayList<>(fixed);
mutable.add("Agent"); // 可以
```

两者都只限制列表结构，不会自动让元素对象深度不可变。对外暴露集合时要明确调用者能否增删、是否允许 null，以及返回的是视图还是快照。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> `List.of(...)` 创建不可修改且拒绝 null 的列表；`new ArrayList<>()` 创建可增删列表。真正落地时还要结合调用契约和运行边界验证。

---

### Q24. 用 Map 当 DTO 一定错误吗？

**面试官提问**

> 用 Map 当 DTO 一定错误吗？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不是绝对错误，关键在于结构是否稳定、是否值得形成明确契约。

稳定的用户请求、响应和跨层数据若长期使用 `Map<String, Object>`，会失去字段拼写检查、明确类型、IDE 重构、校验入口和清晰 API 文档，通常更适合 class 或 record。动态属性、用户自定义字段、统计分组、索引、缓存、请求头和结构尚不确定的 JSON 边界使用 Map 很合理。

User 的 name、email、skills 是稳定字段，应使用 User 或 CreateUserCommand；`Map<Long, User>` 则是在内存仓储中表达“ID 到用户”的索引，使用 Map 非常合适。

集合类型表达不同的数据语义：List 关注顺序和重复，Set 关注唯一性，Map 关注键到值的映射；具体实现还会带来顺序、空值、复杂度和线程安全差异。在当前学习项目里，用户输入和输出有稳定字段时使用 DTO 或 record，领域 User 保护业务状态；只有动态扩展字段、临时聚合等边界场景才考虑 Map。我还会主动说明适用边界：Map 不是绝对禁止；动态属性、适配层和临时聚合可以使用，但稳定业务契约更适合显式类型。

**结合当天项目**

用户输入和输出有稳定字段时使用 DTO 或 record，领域 User 保护业务状态；只有动态扩展字段、临时聚合等边界场景才考虑 Map。

**原理与边界**

集合类型表达不同的数据语义：List 关注顺序和重复，Set 关注唯一性，Map 关注键到值的映射；具体实现还会带来顺序、空值、复杂度和线程安全差异。 Map 不是绝对禁止；动态属性、适配层和临时聚合可以使用，但稳定业务契约更适合显式类型。

**常见错误回答**

> “用 Map 当 DTO 一定错误吗，答案绝对只有一种，记住结论就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 用户输入和输出有稳定字段时使用 DTO 或 record，领域 User 保护业务状态；只有动态扩展字段、临时聚合等边界场景才考虑 Map。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** Map 不是绝对禁止；动态属性、适配层和临时聚合可以使用，但稳定业务契约更适合显式类型。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不是绝对错误，关键在于结构是否稳定、是否值得形成明确契约。真正落地时还要结合调用契约和运行边界验证。

---

### Q25. Maven 是什么，为什么项目需要它？

**面试官提问**

> Maven 是什么，为什么项目需要它？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：Maven 是 Java 项目的构建与依赖管理工具。它读取 `pom.xml`，按照标准目录和生命周期解析依赖、调用 JDK 编译、运行测试并打包构件。

它解决了团队手工下载 jar、拼 classpath、各自决定目录和构建命令造成的不一致。Maven 不是 JDK，也不是 IDE：JDK 提供底层编译运行能力，IDE 帮助编辑调试，Maven 组织可重复构建。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。我还会主动说明适用边界：依赖声明不等于运行时一定可见，scope、冲突解析、插件和实际 classpath 都需要通过构建或运行验证。

**结合当天项目**

我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 依赖声明不等于运行时一定可见，scope、冲突解析、插件和实际 classpath 都需要通过构建或运行验证。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 依赖声明不等于运行时一定可见，scope、冲突解析、插件和实际 classpath 都需要通过构建或运行验证。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> Maven 是 Java 项目的构建与依赖管理工具。它读取 `pom.xml`，按照标准目录和生命周期解析依赖、调用 JDK 编译、运行测试并打包构件。真正落地时还要结合调用契约和运行边界验证。

---

### Q26. `groupId`、`artifactId` 和 `version` 是什么？

**面试官提问**

> `groupId`、`artifactId` 和 `version` 是什么？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：三者组成 Maven 构件坐标，例如：

```text
com.example:day1-user-management:1.0.0
```

`groupId` 表示组织命名空间，`artifactId` 表示具体项目或构件，`version` 表示版本。依赖声明也通过坐标告诉 Maven 要解析哪个构件，远程下载后通常缓存到 `~/.m2/repository`。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 三者组成 Maven 构件坐标，例如：；真正落地时还要结合调用契约和运行边界验证。

---

### Q27. `mvn compile`、`test`、`package` 和 `clean` 有什么关系？

**面试官提问**

> `mvn compile`、`test`、`package` 和 `clean` 有什么关系？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：它们对应构建阶段或目标：`compile` 编译正式代码，`test` 在必要编译后运行测试，`package` 在完成前置阶段后生成 jar 等构件；`clean` 属于清理生命周期，删除生成目录 `target`。

执行靠后的阶段会先完成它需要的前置阶段，所以 `mvn package` 通常包含编译和测试，不只是压缩文件。`mvn clean package` 表示先移除旧产物，再从干净状态构建。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 它们对应构建阶段或目标：`compile` 编译正式代码，`test` 在必要编译后运行测试，`package` 在完成前置阶段后生成 jar 等构件；`clean` 属于清理生命周期，删除生成目录 `target`。真正落地时还要结合调用契约和运行边界验证。

---

### Q28. `package`、`import` 与 classpath 有什么区别？

**面试官提问**

> `package`、`import` 与 classpath 有什么区别？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：- `package` 声明类型所在的语言级命名空间，并参与访问控制；
- `import` 允许源码使用类型的简单名称，不会复制源码或安装依赖；
- classpath 是编译器和 JVM 查找类与资源的一组位置。

```java
package com.example.day1;
import java.util.List;
```

即使写了 import，如果相关 class 或 jar 不在编译路径中，仍然无法编译。Java package 也不等于 npm package；Maven artifact 更接近可发布依赖单元。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。我还会主动说明适用边界：依赖声明不等于运行时一定可见，scope、冲突解析、插件和实际 classpath 都需要通过构建或运行验证。

**结合当天项目**

我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 依赖声明不等于运行时一定可见，scope、冲突解析、插件和实际 classpath 都需要通过构建或运行验证。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会回到 Day1 Maven 用户管理工程，指出 pom.xml、src/main/java、package 声明和 classpath 如何共同决定源码被编译、类被定位以及 App.main 如何启动。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 依赖声明不等于运行时一定可见，scope、冲突解析、插件和实际 classpath 都需要通过构建或运行验证。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> `package` 声明类型所在的语言级命名空间，并参与访问控制；；真正落地时还要结合调用契约和运行边界验证。

---

### Q29. 类、对象和构造器分别是什么？

**面试官提问**

> 类、对象和构造器分别是什么？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：类定义一类对象的状态与行为；对象是运行时根据类创建的具体实例；构造器在 `new` 时建立初始状态。

```java
User alice = new User(1L, "Alice", "alice@example.com");
```

`User` 是类，`new User(...)` 创建对象并调用构造器，`alice` 保存指向该对象的引用。构造器与类同名且没有返回值类型；写 `void User(...)` 会变成一个普通方法，而不是构造器。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 类定义一类对象的状态与行为；对象是运行时根据类创建的具体实例；构造器在 `new` 时建立初始状态。真正落地时还要结合调用契约和运行边界验证。

---

### Q30. `this` 与 `final` 分别表示什么？

**面试官提问**

> `this` 与 `final` 分别表示什么？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：`this` 表示当前实例，可用于区分字段和同名参数、调用当前对象方法或在构造器间委托。静态方法没有当前实例，因此不能使用实例意义上的 `this`。

`final` 的含义取决于位置：final 类不能继承，final 实例方法不能重写，final 变量只能赋值一次。final 引用不能重新指向另一个对象，但不自动保证所指对象不可变。

```java
final List<String> names = new ArrayList<>();
names.add("Alice");       // 可以，List 本身可变
// names = new ArrayList<>(); // 不可以，引用不能重新赋值
```

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。我还会主动说明适用边界：final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**结合当天项目**

我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> `this` 表示当前实例，可用于区分字段和同名参数、调用当前对象方法或在构造器间委托。静态方法没有当前实例，因此不能使用实例意义上的 `this`。真正落地时还要结合调用契约和运行边界验证。

---

### Q31. 什么是封装，为什么不是“private + getter/setter”？

**面试官提问**

> 什么是封装，为什么不是“private + getter/setter”？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：封装是隐藏内部表示，通过受控方法维护对象不变量，让调用者依赖稳定契约。如果给每个 private 字段都提供任意 setter，调用者仍可能把对象改成非法状态，只是换了一条写入路径。

例如修改邮箱应校验空值、格式和标准化规则；集合字段返回时还要考虑调用者能否从外部修改内部集合。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。我还会主动说明适用边界：只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。

**结合当天项目**

我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 只有 equals 与 hashCode 契约一致且参与计算的字段在容器存续期间稳定，哈希集合和去重结果才可靠。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 封装是隐藏内部表示，通过受控方法维护对象不变量，让调用者依赖稳定契约。如果给每个 private 字段都提供任意 setter，调用者仍可能把对象改成非法状态，只是换了一条写入路径。真正落地时还要结合调用契约和运行边界验证。

---

### Q32. Java 接口可以包含哪些成员？

**面试官提问**

> Java 接口可以包含哪些成员？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：接口可以声明抽象方法、default 方法、static 方法和 private 辅助方法；接口字段隐式为 `public static final` 常量，不能保存每个实现对象各自的普通实例状态。

抽象方法由实现类提供行为，default 提供可继承的默认实现，static 通过接口名调用，private 只供接口内部复用。实现多个接口遇到冲突 default 方法时，类必须按规则消解冲突。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 接口可以声明抽象方法、default 方法、static 方法和 private 辅助方法；接口字段隐式为 `public static final` 常量，不能保存每个实现对象各自的普通实例状态。真正落地时还要结合调用契约和运行边界验证。

---

### Q33. Java 接口与 TypeScript 接口有什么区别？

**面试官提问**

> Java 接口与 TypeScript 接口有什么区别？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：TypeScript 接口主要采用结构化类型并服务编译期检查，生成 JavaScript 后通常被擦除；Java 接口属于名义类型体系，实现类通常显式 `implements`，接口信息进入 class 文件并能被 JVM、反射和框架读取。

两者都能表达调用方需要的契约，但不要把 TS 的“结构碰巧相同即可兼容”直接套到 Java，也不要把 Java `public class` 简单等同于 TypeScript `export class`。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。我还会主动说明适用边界：抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**结合当天项目**

UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 抽象必须对应真实变化边界；只有一个实现且没有独立契约时，一类一接口和机械分层只会增加跳转。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> TypeScript 接口主要采用结构化类型并服务编译期检查，生成 JavaScript 后通常被擦除；Java 接口属于名义类型体系，实现类通常显式 `implements`，接口信息进入 class 文件并能被 JVM、反射和框架读取。真正落地时还要结合调用契约和运行边界验证。

---

### Q34. 什么是多态和动态分派？

**面试官提问**

> 什么是多态和动态分派？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：多态允许变量和参数使用接口或父类型，而运行时对象可以是不同实现。调用被重写的实例方法时，JVM 根据实际对象选择实现，这叫动态分派。

```java
Notifier notifier = new EmailNotifier(); // 编译期类型 Notifier
notifier.send("完成");                   // 运行时执行 EmailNotifier.send
```

它让调用方只依赖能力契约，新增实现时不必修改所有调用处。重载是编译期根据参数选择，不属于同一类运行时分派。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** UserService 通过 UserRepository 接口使用 InMemoryUserRepository，运行时发生动态分派；Service 与 Repository 是使用关系，所以采用组合而不是继承。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 多态允许变量和参数使用接口或父类型，而运行时对象可以是不同实现。调用被重写的实例方法时，JVM 根据实际对象选择实现，这叫动态分派。真正落地时还要结合调用契约和运行边界验证。

---

### Q35. 依赖注入是什么，为什么不在 Service 里直接 `new`？

**面试官提问**

> 依赖注入是什么，为什么不在 Service 里直接 `new`？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：依赖注入是由外部把对象需要的依赖提供给它，构造器注入是最明确的一种方式：

```java
UserService service = new UserService(repository);
```

如果 UserService 内部写死 `new InMemoryUserRepository()`，业务逻辑会直接依赖具体存储实现，更换数据库实现和隔离测试都更困难。构造器注入同时保证对象创建完成时必要依赖已经存在。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 依赖注入是由外部把对象需要的依赖提供给它，构造器注入是最明确的一种方式：；真正落地时还要结合调用契约和运行边界验证。

---

### Q36. Java 泛型为什么会类型擦除？它有什么影响？

**面试官提问**

> Java 泛型为什么会类型擦除？它有什么影响？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：Java 泛型主要通过编译期检查和擦除后的兼容表示实现。编译器验证元素类型、插入必要转换，而运行时 `List<String>` 与 `List<Integer>` 的具体参数通常不作为两个不同类存在。

影响包括：不能直接 `new T()`，不能用 `instanceof List<String>` 检查元素参数，也不能只靠擦除后相同的泛型参数声明两个重载。类型擦除不代表泛型没用，它已经把许多类型错误提前到编译期。

泛型在编译期建立参数化类型约束；Java 泛型默认不变，通配符表达未知类型的读写边界，类型擦除不等于泛型没有作用。在当前学习项目里，我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。

**原理与边界**

泛型在编译期建立参数化类型约束；Java 泛型默认不变，通配符表达未知类型的读写边界，类型擦除不等于泛型没有作用。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会用内存用户管理案例中的 List 用户结果、Set 技能去重、Map 按 ID 查找以及 equals/hashCode 去重行为说明，而不是只背集合定义。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> Java 泛型主要通过编译期检查和擦除后的兼容表示实现。编译器验证元素类型、插入必要转换，而运行时 `List<String>` 与 `List<Integer>` 的具体参数通常不作为两个不同类存在。真正落地时还要结合调用契约和运行边界验证。

---

### Q37. 为什么 `List<String>` 不是 `List<Object>` 的子类型？

**面试官提问**

> 为什么 `List<String>` 不是 `List<Object>` 的子类型？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：因为 Java 泛型默认不变。假如允许把 `List<String>` 赋给 `List<Object>`，调用方就能通过 Object 列表加入 Integer，破坏原列表只允许 String 的承诺。

只读遍历未知元素列表可使用 `List<?>`；需要更灵活的生产者和消费者边界时再学习 `? extends T`、`? super T` 与 PECS。

泛型在编译期建立参数化类型约束；Java 泛型默认不变，通配符表达未知类型的读写边界，类型擦除不等于泛型没有作用。在当前学习项目里，用户邮箱、姓名等内容比较使用 equals 或 Objects.equals，不能利用字符串池偶然造成的引用相同；标准化后的新字符串也不会修改原对象。我还会主动说明适用边界：这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

用户邮箱、姓名等内容比较使用 equals 或 Objects.equals，不能利用字符串池偶然造成的引用相同；标准化后的新字符串也不会修改原对象。

**原理与边界**

泛型在编译期建立参数化类型约束；Java 泛型默认不变，通配符表达未知类型的读写边界，类型擦除不等于泛型没有作用。 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 用户邮箱、姓名等内容比较使用 equals 或 Objects.equals，不能利用字符串池偶然造成的引用相同；标准化后的新字符串也不会修改原对象。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day1 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 因为 Java 泛型默认不变。假如允许把 `List<String>` 赋给 `List<Object>`，调用方就能通过 Object 列表加入 Integer，破坏原列表只允许 String 的承诺。真正落地时还要结合调用契约和运行边界验证。

---

### Q38. `record` 是否等于深度不可变对象？

**面试官提问**

> `record` 是否等于深度不可变对象？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不等于。record 的组件引用在构造后不能重新赋值，并自动生成基于组件的访问器、equals、hashCode 和 toString，但如果组件指向可变 List，对方仍可能修改该 List。

需要快照时在构造阶段使用 `List.copyOf()` 等方式做防御性复制；其中元素本身若可变，仍只是浅层不可修改。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，用户输入和输出有稳定字段时使用 DTO 或 record，领域 User 保护业务状态；只有动态扩展字段、临时聚合等边界场景才考虑 Map。我还会主动说明适用边界：final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**结合当天项目**

用户输入和输出有稳定字段时使用 DTO 或 record，领域 User 保护业务状态；只有动态扩展字段、临时聚合等边界场景才考虑 Map。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day1 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**常见错误回答**

> “`record` 是否等于深度不可变对象，答案绝对只有一种，记住结论就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 用户输入和输出有稳定字段时使用 DTO 或 record，领域 User 保护业务状态；只有动态扩展字段、临时聚合等边界场景才考虑 Map。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不等于。record 的组件引用在构造后不能重新赋值，并自动生成基于组件的访问器、equals、hashCode 和 toString，但如果组件指向可变 List，对方仍可能修改该 List。真正落地时还要结合调用契约和运行边界验证。

---

### Q39. `HashMap` 的顺序和 null 行为是什么？

**面试官提问**

> `HashMap` 的顺序和 null 行为是什么？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：HashMap 不保证迭代顺序，不能依赖某次运行看起来稳定的输出。JDK HashMap 允许一个 null Key 和多个 null Value，但业务 API 是否允许 null 应由契约决定，不能因为实现支持就随意使用。

需要保留插入顺序可选择 LinkedHashMap，需要按 Key 排序可选择 TreeMap。`get(key)` 返回 null 可能表示 Key 不存在，也可能表示映射值就是 null，需要时用 `containsKey()` 区分。

集合类型表达不同的数据语义：List 关注顺序和重复，Set 关注唯一性，Map 关注键到值的映射；具体实现还会带来顺序、空值、复杂度和线程安全差异。在当前学习项目里，用户尚未保存时 ID 可以用 Long 表达缺失，而循环计数和页大小用 int；这样能同时说明可空语义、泛型限制、拆箱风险和数值边界。我还会主动说明适用边界：复杂度描述随规模增长的趋势；HashMap 的 O(1) 通常是平均情况，常数、冲突、缓存和数据规模会影响实际表现。

**结合当天项目**

用户尚未保存时 ID 可以用 Long 表达缺失，而循环计数和页大小用 int；这样能同时说明可空语义、泛型限制、拆箱风险和数值边界。

**原理与边界**

集合类型表达不同的数据语义：List 关注顺序和重复，Set 关注唯一性，Map 关注键到值的映射；具体实现还会带来顺序、空值、复杂度和线程安全差异。 复杂度描述随规模增长的趋势；HashMap 的 O(1) 通常是平均情况，常数、冲突、缓存和数据规模会影响实际表现。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 用户尚未保存时 ID 可以用 Long 表达缺失，而循环计数和页大小用 int；这样能同时说明可空语义、泛型限制、拆箱风险和数值边界。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 复杂度描述随规模增长的趋势；HashMap 的 O(1) 通常是平均情况，常数、冲突、缓存和数据规模会影响实际表现。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day1 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> HashMap 不保证迭代顺序，不能依赖某次运行看起来稳定的输出。JDK HashMap 允许一个 null Key 和多个 null Value，但业务 API 是否允许 null 应由契约决定，不能因为实现支持就随意使用。真正落地时还要结合调用契约和运行边界验证。

---

### Q40. O(1)、O(n) 和摊销 O(1) 怎么解释？

**面试官提问**

> O(1)、O(n) 和摊销 O(1) 怎么解释？

**候选人回答（可直接口述）**

我会先说明，大 O 复杂度描述的是输入规模增长时，操作成本的增长趋势，不是某次执行精确用了多少纳秒。O(1) 表示核心步骤通常不随元素数量增长，例如 ArrayList 已知索引读取；O(n) 表示工作量可能和元素数量同级增长，例如线性查找；摊销 O(1) 则表示单次操作偶尔很贵，但把成本分摊到长期多次操作后，平均增长趋势接近常数，ArrayList 尾部追加就是典型例子。

我不会因为看到 O(1) 就直接断言它一定更快。真实耗时还受常数、CPU 缓存、对象分配、装箱、哈希冲突和数据规模影响。复杂度主要用于比较规模增长后的趋势，具体优化仍要靠测量。

**结合当天项目**

用户列表按索引读取通常是 O(1)，按邮箱遍历查找是 O(n)；向 ArrayList 尾部添加大多很快，但容量不足时会扩容和复制，因此描述为摊销 O(1)。

**原理与边界**

复杂度省略常数和低阶项，也不表示最坏、平均和摊销是同一概念。回答 HashMap 时还要明确通常讨论平均 O(1)，不能把它写成无条件保证。

**常见错误回答**

> “O(1) 永远比 O(n) 快，ArrayList 的 add 每次都是固定耗时。”

这混淆了增长趋势、单次操作和摊销成本，也忽略了小数据与硬件常数。

**继续追问**

1. **追问：为什么 ArrayList 尾部追加不是严格每次 O(1)？**
   **参考回答：** 大多数追加只写入下一个位置，但容量不足时需要申请更大数组并复制已有元素，单次可能是 O(n)；扩容不是每次发生，所以长期分摊后通常称摊销 O(1)。
2. **追问：复杂度更低是否在小数据下一定更快？**
   **参考回答：** 不一定。更复杂的数据结构可能有更高初始化、哈希或内存访问成本，小数据的线性扫描反而可能更简单；应先保证语义正确，再用基准和分析工具验证热点。
3. **追问：你会怎样用这个知识优化 Day1 项目？**
   **参考回答：** 当前数据小，优先保留清楚的 List 遍历；只有确认按 ID 或邮箱查询频繁且规模增大后，才增加 Map 索引，并同时承担更新一致性成本。

**一句话收尾**

> 大 O 用来判断规模增长趋势，摊销复杂度用于分摊偶发昂贵操作，真实优化仍需结合数据和测量。

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

这个 POM 可以按下面顺序阅读：

| 配置 | 在本项目中的作用 |
|---|---|
| `modelVersion` | 声明当前 POM 模型版本，Maven 4.x POM 通常写 `4.0.0` |
| `groupId` | 项目所属命名空间 `com.example` |
| `artifactId` | 构件名称 `day1-user-management` |
| `version` | 当前构件版本 `1.0.0` |
| `maven.compiler.release` | 以 Java 21 的语言和标准库 API 为编译目标 |
| `project.build.sourceEncoding` | 源码使用 UTF-8，避免不同机器默认编码不一致 |
| `maven-compiler-plugin` | Maven 编译阶段调用的编译插件配置 |

当前案例只使用 JDK 标准库，所以没有 `<dependencies>`。后续加入 JUnit、JSON 库或 Spring 时，依赖会声明在 POM 中，而不是手工把 jar 拖进项目。

执行：

```bash
mvn clean package
```

预期核心过程是：删除旧 `target`、编译五个正式 Java 文件、运行已有测试（当前没有测试类时不会执行具体测试用例）、在 `target` 下生成 jar。随后示例使用 `target/classes` 直接运行主类，是为了暂不引入“可执行 fat jar”插件配置。

> **常见错误**：如果出现 `mvn: command not found`，说明终端没有可用的 Maven 命令；如果出现 `invalid target release: 21`，通常是 Maven 实际使用的 JDK 版本低于 21，可先检查 `mvn -version`，不要只看 IntelliJ IDEA 中显示的 SDK。

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
