---
day: 4
title: Java 异常、文件 I/O 与 JSON——可靠地备份和恢复用户数据
date: '2026-08-27'
summary: 用异常转换、try-with-resources、Path/Files、UTF-8、Jackson 和原子替换实现可靠的 JSON 备份。
tags:
  - Java
  - 异常
  - 文件IO
  - JSON
  - Jackson
status: planned
duration: 90 分钟
---
# Day4：Java 异常、文件 I/O 与 JSON

> **主线**：90 分钟分享可只读标记为“主线”的部分。
> **深挖**：面试题、练习和完整源码放在后半部分。
> **课程边界**：不展开文件锁、并发写入、数据库事务、复杂迁移、Stream 和 Spring。

## 快速目录

- [0. 分享信息](#0-分享信息)
- [2. Java 异常体系](#2-java-异常体系)
- [3. try-with-resources](#3-try-with-resources)
- [5. JSON、Jackson 与 Maven](#5-jsonjackson-与-maven)
- [8. 安全写入：同目录临时文件加替换](#8-安全写入同目录临时文件加替换)
- [12. 高频面试题与参考答案（24 题）](#12-高频面试题与参考答案24-题)
- [附录 A：完整可运行项目](#附录-a完整可运行项目)

## 0. 分享信息

### 目标受众与前置知识

适合已完成 Day1–Day3，能阅读类、接口、集合、Optional 和 Repository 分层的前端开发者。需要会运行 JDK 21 程序，知道 JSON 是文本交换格式，不要求用过 Jackson。

### 学习目标

完成后应能：

1. 区分 checked exception、unchecked exception 和 Error；
2. 解释异常转换、异常链和 suppressed exception；
3. 用 try-with-resources 正确关闭文件；
4. 用 Path、Files 和 UTF-8 读写文本；
5. 用 Jackson 映射 record 与 JSON；
6. 设计带 schemaVersion 的备份；
7. 用同目录临时文件和原子替换降低损坏风险；
8. 区分缺失文件、损坏 JSON、未知版本和写入失败。

### 90 分钟安排

| 时间 | 内容 |
|---|---|
| 0–8 分钟 | Day3 回顾与直接覆盖文件反例 |
| 8–23 分钟 | 异常分类、传播、转换和异常链 |
| 23–34 分钟 | try-with-resources 与资源生命周期 |
| 34–45 分钟 | Path、Files、UTF-8 |
| 45–57 分钟 | JSON、Jackson、Maven 传递依赖 |
| 57–68 分钟 | Snapshot、Backup、schemaVersion |
| 68–80 分钟 | 临时文件、原子替换与回退 |
| 80–87 分钟 | 运行、故障注入和排查 |
| 87–90 分钟 | 总结与 Day5 预告 |

- **必须讲清**：决定接口语义和可靠性的内容。
- **现场演示**：建议实际运行或断点观察。
- **容易被问**：面试或代码评审中的追问。

## 1. 反例：直接覆盖正式文件为什么危险

```java
// 局部反例：不要用于重要数据
Files.writeString(Path.of("users.json"), json);
```

如果序列化、磁盘写入或进程在中途失败，原来的好文件可能已经被截断。下一次启动既没有旧数据，也没有完整新数据。

另一个反例：

```java
try {
    // 读取 JSON
} catch (Exception exception) {
    return Optional.empty();
}
```

它把“文件不存在”和“文件存在但已损坏”混为一谈。调用者会以为没有备份，实际数据已经坏了。

**必须讲清**

- 文件不存在可以是正常状态；
- 文件内容损坏是故障，应显式失败；
- 不能为了继续运行而吞异常；
- 备份要尽量做到旧文件或新文件至少有一个完整。

**JS/TS 对照**

前端也不能把 404、损坏 JSON 和网络超时全部转换成空数组。UI 看似没报错，却掩盖真实故障。

## 2. Java 异常体系

```text
Throwable
├── Error
└── Exception
    ├── RuntimeException
    └── 其他受检异常，例如 IOException
```

### 2.1 checked exception

除 RuntimeException 及其子类外，多数 Exception 是受检异常。编译器要求捕获，或在方法签名用 `throws` 继续声明。IOException 是典型例子。

```java
String read(Path path) throws IOException {
    return Files.readString(path, StandardCharsets.UTF_8);
}
```

### 2.2 unchecked exception

RuntimeException 及其子类不要求显式捕获或声明。非法参数、非法状态、领域规则失败常用 unchecked exception 表达。

本课 `UserStorageException` 继承 RuntimeException。应用层不用被 Jackson、Path、IOException 等基础设施细节污染，但异常仍会传播。

### 2.3 Error

Error 通常表示 JVM 或环境层面的严重问题，例如 `OutOfMemoryError`。业务代码通常不捕获后假装恢复。

### 2.4 catch 顺序

先捕获具体异常，再捕获宽泛父类。反过来写，后面的具体 catch 永远到不了，会编译失败。

```java
try {
    // ...
} catch (AtomicMoveNotSupportedException exception) {
    // 具体异常
} catch (IOException exception) {
    // 更宽泛异常
}
```

### 2.5 异常转换与异常链

```java
catch (IOException exception) {
    throw new UserStorageException("读取用户备份失败: " + target, exception);
}
```

第二个参数是 cause，保留原异常类型、消息和堆栈。

```java
// 反例：根因丢失
throw new UserStorageException("读取失败");
```

**面试回答模板**

> checked exception 由编译器要求捕获或声明，适合调用者可能有恢复策略的外部失败；unchecked exception 不强制处理，常用于编程错误或跨层统一异常。工程上还要看 API 是否应该暴露底层细节。异常转换必须保留 cause。

## 3. try-with-resources

只要对象实现 `AutoCloseable`，就可放在 try 括号中：

```java
try (var reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
    return reader.readLine();
}
```

无论正常返回还是抛异常，资源都会关闭。

手写 finally 容易漏关闭，而且 close 自身也可能抛异常。try-with-resources 会保留主异常，把关闭异常放入 `getSuppressed()`。

多个资源按声明的相反顺序关闭：

```java
try (var first = openFirst(); var second = openSecond()) {
    // second 先关闭，first 后关闭
}
```

**容易被问：有 GC 为什么还要 close？**

GC 管理 Java 对象可达性，不保证及时释放文件描述符等外部资源。资源生命周期必须明确。

## 4. Path、Files 与 UTF-8

```java
Path path = Path.of("data/users.json");
Path absolute = path.toAbsolutePath().normalize();
```

Path 是路径值对象，Files 才执行创建目录、打开流、移动和删除等操作。

显式指定编码：

```java
Files.newBufferedReader(path, StandardCharsets.UTF_8);
Files.newBufferedWriter(path, StandardCharsets.UTF_8);
```

相对路径通常相对于进程当前工作目录，不是源码目录，也不一定是 jar 所在目录。

| API | 用途 | 注意 |
|---|---|---|
| `Files.exists/notExists` | 判断存在性 | 权限不足时可能无法确认 |
| `createDirectories` | 创建多级目录 | 已存在通常不报错 |
| `newBufferedReader` | 字符读取 | 显式 charset |
| `newBufferedWriter` | 字符写入 | 显式 charset |
| `createTempFile` | 唯一临时文件 | 使用目标同目录 |
| `move` | 移动/替换 | 原子移动受文件系统限制 |
| `deleteIfExists` | 尝试删除 | 清理失败仍需日志 |

## 5. JSON、Jackson 与 Maven

JSON 定义数据格式，却不知道 Java 的 User、record 或构造器。Jackson Databind 负责 Java 对象与 JSON 的双向映射。

本课使用 Jackson Databind 2.21.5：2.21 是官方标记的 LTS 分支，2.21.5 是该分支在 2026-07-06 发布的补丁版本。这里保留 Jackson 2 的 `com.fasterxml.jackson` 包名，避免入门阶段同时引入 Jackson 3 的迁移差异。

POM 只显式声明：

```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.21.5</version>
</dependency>
```

Maven 会传递解析 Databind 依赖的 jackson-core 和 jackson-annotations，这叫传递依赖。

**必须讲清**

- POM 是声明，不会让裸 `javac` 自动找到 jar；
- Maven 构建时解析依赖并组织 classpath；
- 当前机器没有 Maven，本课从 Maven Central 下载 jar 后用 `javac -cp` 替代验证；
- 这不等于 `mvn test` 或 `mvn package` 已成功。

## 6. Snapshot、Backup 和 schemaVersion

不把领域 User 直接当长期 JSON 契约，而使用：

```text
User → UserSnapshot → UserBackup → JSON
JSON → UserBackup → UserSnapshot → User
```

```json
{
  "schemaVersion": 1,
  "users": [{
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "skills": ["Java", "TypeScript"]
  }]
}
```

好处：

1. 领域对象演进时不必直接改变存储契约；
2. 顶层可增加创建时间和来源；
3. schemaVersion 让读取方判断是否理解文件。

当前代码只理解版本 1。非 1 版本会抛 UserStorageException，cause 记录期望值和实际值。静默读取未知版本可能造成语义错读。

record 适合数据快照，但只是浅不可变。`UserSnapshot` 和 `UserBackup` 都对 List 使用 `List.copyOf`。

## 7. 接口与依赖方向

```java
public interface UserBackupStore {
    void write(UserBackup backup);
    Optional<UserBackup> read();
}
```

```text
App
 ├── InMemoryUserRepository
 ├── JacksonUserBackupStore
 └── UserBackupService
       ├── UserRepository
       └── UserBackupStore
```

文件不存在由 `read()` 返回 `Optional.empty()`；存在但损坏则抛异常。这明确区分正常缺失与异常失败。

## 8. 安全写入：同目录临时文件加替换

### 8.1 算法

```text
1. 创建目标父目录
2. 在目标同目录创建唯一临时文件
3. 完整写入 JSON 并关闭
4. 尝试 ATOMIC_MOVE + REPLACE_EXISTING
5. 不支持原子移动时回退普通替换
6. 任一步失败，在 finally 删除临时文件
```

同目录增加同一文件系统内原子移动的可能。原子移动让观察者尽量只看到旧文件或新文件，不看到半个文件。

```java
try {
    Files.move(temp, target, ATOMIC_MOVE, REPLACE_EXISTING);
} catch (AtomicMoveNotSupportedException exception) {
    Files.move(temp, target, REPLACE_EXISTING);
}
```

只在明确不支持原子移动时回退。权限或磁盘故障必须继续传播。

原子替换不等于完整事务，也未解决多个写者、文件锁、刷盘和多文件一致性。

## 9. 完整调用链

### 9.1 备份

```text
App → UserBackupService.backup()
→ repository.findAll()
→ UserSnapshot.from(user)
→ UserBackup.current(...)
→ store.write(...)
→ Jackson 序列化
→ 临时文件
→ 替换正式文件
```

### 9.2 恢复

```text
App → UserBackupService.restore()
→ store.read()
→ 缺失：返回 0
→ 解析 JSON
→ 校验版本
→ clear
→ snapshot.toUser()
→ save
```

当前实现解析和版本校验成功后清空仓储，再逐条恢复。生产中可以先把全部快照转换成临时集合，全部成功后整体替换，避免部分恢复。

## 10. 运行、输出与故障注入

当前环境替代验证：

```bash
find src -name '*.java' -print0 |
  xargs -0 javac --release 21 -cp 'lib/*' -d out

java -cp 'out:lib/*' com.example.day4.App /tmp/users.json
```

预期输出：

```text
备份文件: users.json
恢复数量: 2
恢复用户: [1:Alice[Java, TypeScript], 2:Bob[Java, Vue]]
```

故障验证：

```text
缺失文件: Optional.empty
损坏 JSON: 读取用户备份失败: ...
损坏 JSON cause: JsonParseException
未知版本: 不支持的 schemaVersion: 2
未知版本 cause: IllegalArgumentException
写入失败: 写入用户备份失败: ...
写入失败 cause: FileSystemException
残留临时文件: 0
```

## 11. 错误排查

| 现象 | 原因 | 排查 |
|---|---|---|
| `NoClassDefFoundError: ObjectMapper` | 运行 classpath 缺 Jackson | 编译、运行均加所有 jar |
| `package com.fasterxml... does not exist` | 编译 classpath 缺 jar | 检查 `-cp 'lib/*'` |
| 中文乱码 | 使用默认编码 | 显式 UTF-8 |
| 找错相对文件 | 工作目录不同 | 打印绝对路径 |
| `AccessDeniedException` | 无写权限 | 查看 cause 和父目录权限 |
| 损坏 JSON 变空数据 | catch 太宽 | 只对不存在返回 empty |
| 临时文件积累 | finally 未清理 | 故障注入后统计 .tmp |
| 文件半写 | 直接写目标 | 完整写临时文件后替换 |
| 未知版本仍恢复 | 无版本校验 | 转换前校验 |

## 12. 高频面试题与参考答案（24 题）

> 本节按真实面试答题方式组织：先直接回答，再结合项目说明原理与边界，最后承接连续追问。不要逐字死背，应理解后用自己的语气表达。

### Q01. checked 和 unchecked 区别？

**面试官提问**

> checked 和 unchecked 区别？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：前者必须捕获或声明；后者不强制。选择还取决于调用者能否恢复和 API 边界。

checked 与 unchecked 的语法差异在编译器是否强制捕获或声明，工程选择还取决于调用者能否恢复以及当前层是否应该暴露底层技术。在当前学习项目里，我会以缺失文件、损坏 JSON、未知版本和写入失败四条验证路径说明不同错误语义，避免全部 catch 后返回空数据。我还会主动说明适用边界：这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会以缺失文件、损坏 JSON、未知版本和写入失败四条验证路径说明不同错误语义，避免全部 catch 后返回空数据。

**原理与边界**

checked 与 unchecked 的语法差异在编译器是否强制捕获或声明，工程选择还取决于调用者能否恢复以及当前层是否应该暴露底层技术。 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “这几个概念差不多，实际开发随便选一个就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会以缺失文件、损坏 JSON、未知版本和写入失败四条验证路径说明不同错误语义，避免全部 catch 后返回空数据。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 前者必须捕获或声明；后者不强制。选择还取决于调用者能否恢复和 API 边界。真正落地时还要结合调用契约和运行边界验证。

---

### Q02. throw 和 throws？

**面试官提问**

> throw 和 throws？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：throw 抛出对象；throws 在签名声明可能传播的受检异常。

checked 与 unchecked 的语法差异在编译器是否强制捕获或声明，工程选择还取决于调用者能否恢复以及当前层是否应该暴露底层技术。在当前学习项目里，JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。我还会主动说明适用边界：这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。

**原理与边界**

checked 与 unchecked 的语法差异在编译器是否强制捕获或声明，工程选择还取决于调用者能否恢复以及当前层是否应该暴露底层技术。 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> throw 抛出对象；throws 在签名声明可能传播的受检异常。真正落地时还要结合调用契约和运行边界验证。

---

### Q03. 为什么不能吞异常？

**面试官提问**

> 为什么不能吞异常？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：会伪造成功并丢失根因，错误在更远处才暴露。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。我还会主动说明适用边界：异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。

**结合当天项目**

JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。

**常见错误回答**

> “因为 Java 就是这样规定的，记住写法即可，不需要解释场景和边界。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 会伪造成功并丢失根因，错误在更远处才暴露。真正落地时还要结合调用契约和运行边界验证。

---

### Q04. 异常转换为何保留 cause？

**面试官提问**

> 异常转换为何保留 cause？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：同时提供上层语义和底层诊断证据。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。我还会主动说明适用边界：异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。

**结合当天项目**

JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 同时提供上层语义和底层诊断证据。真正落地时还要结合调用契约和运行边界验证。

---

### Q05. finally 一定执行吗？

**面试官提问**

> finally 一定执行吗？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：通常执行，但 JVM 强退、崩溃、断电时不能保证。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。我还会主动说明适用边界：final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**结合当天项目**

JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**常见错误回答**

> “finally 一定执行吗，答案绝对只有一种，记住结论就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 通常执行，但 JVM 强退、崩溃、断电时不能保证。真正落地时还要结合调用契约和运行边界验证。

---

### Q06. try-with-resources 条件？

**面试官提问**

> try-with-resources 条件？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：对象实现 AutoCloseable。

AutoCloseable 让编译器生成确定的逆序关闭逻辑；主体和关闭同时失败时，主体异常保留，关闭异常进入 suppressed 列表。在当前学习项目里，JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。我还会主动说明适用边界：异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。

**结合当天项目**

JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。

**原理与边界**

AutoCloseable 让编译器生成确定的逆序关闭逻辑；主体和关闭同时失败时，主体异常保留，关闭异常进入 suppressed 列表。 异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 对象实现 AutoCloseable。真正落地时还要结合调用契约和运行边界验证。

---

### Q07. 关闭异常去哪？

**面试官提问**

> 关闭异常去哪？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：主异常存在时作为 suppressed exception。

AutoCloseable 让编译器生成确定的逆序关闭逻辑；主体和关闭同时失败时，主体异常保留，关闭异常进入 suppressed 列表。在当前学习项目里，JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。我还会主动说明适用边界：异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。

**结合当天项目**

JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。

**原理与边界**

AutoCloseable 让编译器生成确定的逆序关闭逻辑；主体和关闭同时失败时，主体异常保留，关闭异常进入 suppressed 列表。 异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 主异常存在时作为 suppressed exception。真正落地时还要结合调用契约和运行边界验证。

---

### Q08. GC 能代替 close？

**面试官提问**

> GC 能代替 close？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不能及时、确定地释放外部资源。

AutoCloseable 让编译器生成确定的逆序关闭逻辑；主体和关闭同时失败时，主体异常保留，关闭异常进入 suppressed 列表。在当前学习项目里，JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。我还会主动说明适用边界：异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。

**结合当天项目**

JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。

**原理与边界**

AutoCloseable 让编译器生成确定的逆序关闭逻辑；主体和关闭同时失败时，主体异常保留，关闭异常进入 suppressed 列表。 异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。

**常见错误回答**

> “GC 能代替 close，答案绝对只有一种，记住结论就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不能及时、确定地释放外部资源。真正落地时还要结合调用契约和运行边界验证。

---

### Q09. Path 与 File？

**面试官提问**

> Path 与 File？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：Path/NIO.2 更现代，通常配合 Files 使用。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，App 接收可选 Path，默认 data/users.json；Files 负责操作，读写显式使用 UTF-8，并把相对路径解析到当前工作目录后用于诊断。我还会主动说明适用边界：这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

App 接收可选 Path，默认 data/users.json；Files 负责操作，读写显式使用 UTF-8，并把相对路径解析到当前工作目录后用于诊断。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** App 接收可选 Path，默认 data/users.json；Files 负责操作，读写显式使用 UTF-8，并把相对路径解析到当前工作目录后用于诊断。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> Path/NIO.2 更现代，通常配合 Files 使用。真正落地时还要结合调用契约和运行边界验证。

---

### Q10. 为何显式 UTF-8？

**面试官提问**

> 为何显式 UTF-8？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：避免环境默认编码不同。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，App 接收可选 Path，默认 data/users.json；Files 负责操作，读写显式使用 UTF-8，并把相对路径解析到当前工作目录后用于诊断。我还会主动说明适用边界：这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

App 接收可选 Path，默认 data/users.json；Files 负责操作，读写显式使用 UTF-8，并把相对路径解析到当前工作目录后用于诊断。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** App 接收可选 Path，默认 data/users.json；Files 负责操作，读写显式使用 UTF-8，并把相对路径解析到当前工作目录后用于诊断。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 避免环境默认编码不同。真正落地时还要结合调用契约和运行边界验证。

---

### Q11. exists 为 false 一定不存在？

**面试官提问**

> exists 为 false 一定不存在？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不一定，权限不足也可能无法确认。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，App 接收可选 Path，默认 data/users.json；Files 负责操作，读写显式使用 UTF-8，并把相对路径解析到当前工作目录后用于诊断。我还会主动说明适用边界：这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

App 接收可选 Path，默认 data/users.json；Files 负责操作，读写显式使用 UTF-8，并把相对路径解析到当前工作目录后用于诊断。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “exists 为 false 一定不存在，答案绝对只有一种，记住结论就行。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** App 接收可选 Path，默认 data/users.json；Files 负责操作，读写显式使用 UTF-8，并把相对路径解析到当前工作目录后用于诊断。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不一定，权限不足也可能无法确认。真正落地时还要结合调用契约和运行边界验证。

---

### Q12. 为何缺失返回 Optional.empty？

**面试官提问**

> 为何缺失返回 Optional.empty？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：首次运行无备份是正常状态。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会以缺失文件、损坏 JSON、未知版本和写入失败四条验证路径说明不同错误语义，避免全部 catch 后返回空数据。我还会主动说明适用边界：Optional 主要用于返回值表达缺失，不应机械用于所有字段和参数；具体空值策略仍由业务契约决定。

**结合当天项目**

我会以缺失文件、损坏 JSON、未知版本和写入失败四条验证路径说明不同错误语义，避免全部 catch 后返回空数据。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 Optional 主要用于返回值表达缺失，不应机械用于所有字段和参数；具体空值策略仍由业务契约决定。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会以缺失文件、损坏 JSON、未知版本和写入失败四条验证路径说明不同错误语义，避免全部 catch 后返回空数据。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** Optional 主要用于返回值表达缺失，不应机械用于所有字段和参数；具体空值策略仍由业务契约决定。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 首次运行无备份是正常状态。真正落地时还要结合调用契约和运行边界验证。

---

### Q13. 为何损坏 JSON 不返回 empty？

**面试官提问**

> 为何损坏 JSON 不返回 empty？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：它是数据故障，静默处理会掩盖或覆盖数据。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会以缺失文件、损坏 JSON、未知版本和写入失败四条验证路径说明不同错误语义，避免全部 catch 后返回空数据。我还会主动说明适用边界：JSON 文件存在不代表内容有效；缺失、语法损坏、结构不兼容和未知版本必须使用不同语义处理，不能统一伪装成空数据。

**结合当天项目**

我会以缺失文件、损坏 JSON、未知版本和写入失败四条验证路径说明不同错误语义，避免全部 catch 后返回空数据。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 JSON 文件存在不代表内容有效；缺失、语法损坏、结构不兼容和未知版本必须使用不同语义处理，不能统一伪装成空数据。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会以缺失文件、损坏 JSON、未知版本和写入失败四条验证路径说明不同错误语义，避免全部 catch 后返回空数据。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** JSON 文件存在不代表内容有效；缺失、语法损坏、结构不兼容和未知版本必须使用不同语义处理，不能统一伪装成空数据。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 它是数据故障，静默处理会掩盖或覆盖数据。真正落地时还要结合调用契约和运行边界验证。

---

### Q14. ObjectMapper 可共享吗？

**面试官提问**

> ObjectMapper 可共享吗？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：完成配置后读写通常可共享；并发时不要继续改配置。

ObjectMapper 负责 Java 对象与 JSON 之间的映射；完成配置后可以复用，但序列化契约、模块配置和输入可信度仍应在应用边界明确。在当前学习项目里，POM 直接声明 jackson-databind 2.21.5，Maven 再解析 core 与 annotations；当前验证通过显式 classpath 编译，说明 POM 声明和运行时 classpath 不是一回事。我还会主动说明适用边界：JSON 文件存在不代表内容有效；缺失、语法损坏、结构不兼容和未知版本必须使用不同语义处理，不能统一伪装成空数据。

**结合当天项目**

POM 直接声明 jackson-databind 2.21.5，Maven 再解析 core 与 annotations；当前验证通过显式 classpath 编译，说明 POM 声明和运行时 classpath 不是一回事。

**原理与边界**

ObjectMapper 负责 Java 对象与 JSON 之间的映射；完成配置后可以复用，但序列化契约、模块配置和输入可信度仍应在应用边界明确。 JSON 文件存在不代表内容有效；缺失、语法损坏、结构不兼容和未知版本必须使用不同语义处理，不能统一伪装成空数据。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** POM 直接声明 jackson-databind 2.21.5，Maven 再解析 core 与 annotations；当前验证通过显式 classpath 编译，说明 POM 声明和运行时 classpath 不是一回事。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** JSON 文件存在不代表内容有效；缺失、语法损坏、结构不兼容和未知版本必须使用不同语义处理，不能统一伪装成空数据。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 完成配置后读写通常可共享；并发时不要继续改配置。真正落地时还要结合调用契约和运行边界验证。

---

### Q15. 什么是传递依赖？

**面试官提问**

> 什么是传递依赖？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：直接依赖的依赖被构建工具一并解析。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，POM 直接声明 jackson-databind 2.21.5，Maven 再解析 core 与 annotations；当前验证通过显式 classpath 编译，说明 POM 声明和运行时 classpath 不是一回事。我还会主动说明适用边界：依赖声明不等于运行时一定可见，scope、冲突解析、插件和实际 classpath 都需要通过构建或运行验证。

**结合当天项目**

POM 直接声明 jackson-databind 2.21.5，Maven 再解析 core 与 annotations；当前验证通过显式 classpath 编译，说明 POM 声明和运行时 classpath 不是一回事。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 依赖声明不等于运行时一定可见，scope、冲突解析、插件和实际 classpath 都需要通过构建或运行验证。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** POM 直接声明 jackson-databind 2.21.5，Maven 再解析 core 与 annotations；当前验证通过显式 classpath 编译，说明 POM 声明和运行时 classpath 不是一回事。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 依赖声明不等于运行时一定可见，scope、冲突解析、插件和实际 classpath 都需要通过构建或运行验证。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 直接依赖的依赖被构建工具一并解析。真正落地时还要结合调用契约和运行边界验证。

---

### Q16. 为何有 schemaVersion？

**面试官提问**

> 为何有 schemaVersion？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：判断兼容性并支持迁移或拒绝未知结构。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，领域 User 先映射为 UserSnapshot，再放入带 schemaVersion=1 的 UserBackup；未知版本在修改仓储前失败，避免把不理解的数据误当成旧格式。我还会主动说明适用边界：这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

领域 User 先映射为 UserSnapshot，再放入带 schemaVersion=1 的 UserBackup；未知版本在修改仓储前失败，避免把不理解的数据误当成旧格式。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 领域 User 先映射为 UserSnapshot，再放入带 schemaVersion=1 的 UserBackup；未知版本在修改仓储前失败，避免把不理解的数据误当成旧格式。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 判断兼容性并支持迁移或拒绝未知结构。真正落地时还要结合调用契约和运行边界验证。

---

### Q17. record 深度不可变吗？

**面试官提问**

> record 深度不可变吗？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不是，引用指向的对象仍可能可变。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，领域 User 先映射为 UserSnapshot，再放入带 schemaVersion=1 的 UserBackup；未知版本在修改仓储前失败，避免把不理解的数据误当成旧格式。我还会主动说明适用边界：final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**结合当天项目**

领域 User 先映射为 UserSnapshot，再放入带 schemaVersion=1 的 UserBackup；未知版本在修改仓储前失败，避免把不理解的数据误当成旧格式。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 领域 User 先映射为 UserSnapshot，再放入带 schemaVersion=1 的 UserBackup；未知版本在修改仓储前失败，避免把不理解的数据误当成旧格式。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** final、record 和 copyOf 通常只提供引用或容器层面的浅不可变，引用指向的可变对象仍需单独保护。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不是，引用指向的对象仍可能可变。真正落地时还要结合调用契约和运行边界验证。

---

### Q18. 为何不直接序列化 User？

**面试官提问**

> 为何不直接序列化 User？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：避免长期存储契约耦合领域内部结构。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，领域 User 先映射为 UserSnapshot，再放入带 schemaVersion=1 的 UserBackup；未知版本在修改仓储前失败，避免把不理解的数据误当成旧格式。我还会主动说明适用边界：这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

领域 User 先映射为 UserSnapshot，再放入带 schemaVersion=1 的 UserBackup；未知版本在修改仓储前失败，避免把不理解的数据误当成旧格式。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 领域 User 先映射为 UserSnapshot，再放入带 schemaVersion=1 的 UserBackup；未知版本在修改仓储前失败，避免把不理解的数据误当成旧格式。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 避免长期存储契约耦合领域内部结构。真正落地时还要结合调用契约和运行边界验证。

---

### Q19. 什么是原子移动？

**面试官提问**

> 什么是原子移动？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：支持时移动作为不可分割操作对外可见。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，写入先在目标同目录完成临时文件，再尝试 ATOMIC_MOVE + REPLACE_EXISTING；只有明确不支持原子移动时才回退，finally 清理残留临时文件。我还会主动说明适用边界：原子重命名依赖文件系统能力，只保护单个替换观察，不解决多写者、多文件一致性、锁和持久化刷盘。

**结合当天项目**

写入先在目标同目录完成临时文件，再尝试 ATOMIC_MOVE + REPLACE_EXISTING；只有明确不支持原子移动时才回退，finally 清理残留临时文件。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 原子重命名依赖文件系统能力，只保护单个替换观察，不解决多写者、多文件一致性、锁和持久化刷盘。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 写入先在目标同目录完成临时文件，再尝试 ATOMIC_MOVE + REPLACE_EXISTING；只有明确不支持原子移动时才回退，finally 清理残留临时文件。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 原子重命名依赖文件系统能力，只保护单个替换观察，不解决多写者、多文件一致性、锁和持久化刷盘。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 支持时移动作为不可分割操作对外可见。真正落地时还要结合调用契约和运行边界验证。

---

### Q20. 为何可能不支持？

**面试官提问**

> 为何可能不支持？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：跨文件系统或提供者不具备该能力。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，我会以缺失文件、损坏 JSON、未知版本和写入失败四条验证路径说明不同错误语义，避免全部 catch 后返回空数据。我还会主动说明适用边界：这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

我会以缺失文件、损坏 JSON、未知版本和写入失败四条验证路径说明不同错误语义，避免全部 catch 后返回空数据。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 我会以缺失文件、损坏 JSON、未知版本和写入失败四条验证路径说明不同错误语义，避免全部 catch 后返回空数据。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 跨文件系统或提供者不具备该能力。真正落地时还要结合调用契约和运行边界验证。

---

### Q21. 为何只对 AtomicMoveNotSupportedException 回退？

**面试官提问**

> 为何只对 AtomicMoveNotSupportedException 回退？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：其他 I/O 错误不是能力降级，不能掩盖。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。我还会主动说明适用边界：这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**结合当天项目**

JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 这个结论以 Day4 的单进程、内存或本地文件示例为边界；进入并发、数据库、分布式和框架代理后，需要补充相应的一致性与生命周期约束。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 其他 I/O 错误不是能力降级，不能掩盖。真正落地时还要结合调用契约和运行边界验证。

---

### Q22. 临时文件为何同目录？

**面试官提问**

> 临时文件为何同目录？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：提高同文件系统原子替换概率。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，写入先在目标同目录完成临时文件，再尝试 ATOMIC_MOVE + REPLACE_EXISTING；只有明确不支持原子移动时才回退，finally 清理残留临时文件。我还会主动说明适用边界：原子重命名依赖文件系统能力，只保护单个替换观察，不解决多写者、多文件一致性、锁和持久化刷盘。

**结合当天项目**

写入先在目标同目录完成临时文件，再尝试 ATOMIC_MOVE + REPLACE_EXISTING；只有明确不支持原子移动时才回退，finally 清理残留临时文件。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 原子重命名依赖文件系统能力，只保护单个替换观察，不解决多写者、多文件一致性、锁和持久化刷盘。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 写入先在目标同目录完成临时文件，再尝试 ATOMIC_MOVE + REPLACE_EXISTING；只有明确不支持原子移动时才回退，finally 清理残留临时文件。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 原子重命名依赖文件系统能力，只保护单个替换观察，不解决多写者、多文件一致性、锁和持久化刷盘。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 提高同文件系统原子替换概率。真正落地时还要结合调用契约和运行边界验证。

---

### Q23. 原子替换等于事务吗？

**面试官提问**

> 原子替换等于事务吗？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：不等于，没解决多写者、多文件和业务事务。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，写入先在目标同目录完成临时文件，再尝试 ATOMIC_MOVE + REPLACE_EXISTING；只有明确不支持原子移动时才回退，finally 清理残留临时文件。我还会主动说明适用边界：原子重命名依赖文件系统能力，只保护单个替换观察，不解决多写者、多文件一致性、锁和持久化刷盘。

**结合当天项目**

写入先在目标同目录完成临时文件，再尝试 ATOMIC_MOVE + REPLACE_EXISTING；只有明确不支持原子移动时才回退，finally 清理残留临时文件。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 原子重命名依赖文件系统能力，只保护单个替换观察，不解决多写者、多文件一致性、锁和持久化刷盘。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** 写入先在目标同目录完成临时文件，再尝试 ATOMIC_MOVE + REPLACE_EXISTING；只有明确不支持原子移动时才回退，finally 清理残留临时文件。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 原子重命名依赖文件系统能力，只保护单个替换观察，不解决多写者、多文件一致性、锁和持久化刷盘。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 不等于，没解决多写者、多文件和业务事务。真正落地时还要结合调用契约和运行边界验证。

---

### Q24. 异常消息能写绝对路径吗？

**面试官提问**

> 异常消息能写绝对路径吗？

**候选人回答（可直接口述）**

如果面试官问到这个问题，我会先给出结论：内部诊断有用，公共输出要防止泄露敏感目录。

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。在当前学习项目里，JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。我还会主动说明适用边界：异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。

**结合当天项目**

JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。

**原理与边界**

回答时要把语言或 API 的正式契约、JDK 常见实现和 Day4 的工程选择分开说明；能运行只证明当前路径，不能自动证明边界条件也正确。 异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。

**常见错误回答**

> “只要当前示例能运行，就说明这种写法在所有项目中都正确。”

这种回答只有结论或绝对化判断，没有区分语言规范、JDK 实现与工程选择，也无法解释代码为何这样设计，面试官继续追问时很容易暴露只是背诵。

**继续追问**

1. **追问：你能结合当前项目说明它怎样落地吗？**
   **参考回答：** JacksonUserBackupStore 将 IOException 转换为 UserStorageException 并保留 cause，reader/writer 使用 try-with-resources；Verification 会打印 JsonParseException 等根因。
2. **追问：这个结论有什么边界，什么时候需要换一种处理？**
   **参考回答：** 异常分类只是 API 设计工具；finally 在进程强退等情况下不保证执行，资源关闭也不能替代业务事务与恢复策略。
3. **追问：如果在代码评审中看到相反写法，你会怎么判断？**
   **参考回答：** 我会先确认需求语义、数据规模、失败方式和调用方契约，再用 Day4 的可运行例子验证；如果进入并发、数据库或分布式环境，我会补充相应约束，而不是直接照搬教学实现。

**一句话收尾**

> 内部诊断有用，公共输出要防止泄露敏感目录。真正落地时还要结合调用契约和运行边界验证。

---

## 13. 练习（12 题）

1. Files.readString 抛 IOException，属于哪类异常？
2. 补全：`throw new UserStorageException("读取失败", ____);`
3. A、B 依次声明在 try-with-resources 中，谁先关闭？
4. 为什么 IDE 与终端运行相对路径可能指向不同文件？
5. 把默认编码 reader 改成 UTF-8。
6. 缺失、损坏、版本 2 各应返回什么？
7. 新增 createdAt 是否一定升级 schemaVersion？
8. 为什么 Snapshot 要 List.copyOf？
9. 给安全写入步骤排序。
10. 为什么不能对全部 IOException 回退普通 move？
11. 设计先全部转换再清空仓储的恢复。
12. 构造写入失败并验证无临时文件残留。

### 13.1 答案

1. checked exception。
2. 原始异常变量，例如 `exception`。
3. B 先、A 后。
4. 相对路径基于进程当前工作目录。
5. `Files.newBufferedReader(path, StandardCharsets.UTF_8)`。
6. 缺失返回 empty；损坏和未知版本抛 UserStorageException。
7. 不一定；兼容的可选元数据可不升级，结构或语义不兼容必须升级，策略要明确。
8. 防止调用者后续修改传入 List；record 仅浅不可变。
9. 建目录 → 同目录临时文件 → 写完关闭 → 替换 → 失败清理。
10. 权限、磁盘等错误不是原子能力不足，普通 move 也不能合理恢复。
11. 先把全部 Snapshot 转成临时 List<User>，成功后整体替换仓储。
12. 让目标指向包含文件的非空目录使 move 失败，然后统计父目录 .tmp 数量为 0。

## 14. 代码评审与知识检查

- [ ] 缺失文件与解析失败语义不同。
- [ ] reader/writer 均使用 try-with-resources。
- [ ] 明确 UTF-8。
- [ ] 异常转换保留 cause。
- [ ] 顶层有 schemaVersion。
- [ ] 未知版本在修改仓储前失败。
- [ ] record 集合防御性复制。
- [ ] 临时文件和目标同目录。
- [ ] 只对 AtomicMoveNotSupportedException 回退。
- [ ] finally 清理临时文件。
- [ ] App 路径可配置。
- [ ] Jackson 类型没有泄露到应用服务接口。
- [ ] 能解释 suppressed exception。
- [ ] 能解释替代验证不等于 Maven 构建。

## 15. 术语表

| 术语 | 含义 |
|---|---|
| Checked Exception | 编译器要求捕获或声明 |
| Unchecked Exception | RuntimeException 及子类 |
| Cause | 被包装的原始异常 |
| Suppressed Exception | 关闭资源时附加的异常 |
| AutoCloseable | 可自动关闭资源契约 |
| Path | 文件系统路径抽象 |
| Charset | 字符与字节的编码规则 |
| Serialization | 对象转存储格式 |
| Deserialization | 存储格式转对象 |
| Snapshot | 某时刻数据的持久化表示 |
| Schema Version | 数据结构契约版本 |
| Atomic Move | 不可分割移动能力 |
| Transitive Dependency | 由直接依赖带入的依赖 |

## 16. Day5 预告

Day5 将同时实现普通循环版和 Stream 版统计，讲解函数式接口、Lambda、方法引用、Stream 惰性和 Optional 的正确边界。

## 17. 官方资料

- [Java 21 Throwable API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Throwable.html)
- [Dev.java Exceptions](https://dev.java/learn/exceptions/)
- [Java 21 Files API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Files.html)
- [Java 21 Path API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Path.html)
- [Maven Dependency Mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html)
- [Jackson Databind](https://github.com/FasterXML/jackson-databind)
- [Jackson 2.21 LTS Release](https://github.com/FasterXML/jackson/wiki/Jackson-Release-2.21)
- [Jackson 2.21.5 Release Notes](https://github.com/FasterXML/jackson/wiki/Jackson-Release-2.21.5)

---

## 附录 A：完整可运行项目

> 以下文件均为完整代码，文件标记用于从讲义直接提取并验证。

+
### pom.xml

<!-- file: pom.xml -->

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>day4-user-backup</artifactId>
  <version>1.0-SNAPSHOT</version>
  <properties>
    <maven.compiler.release>21</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.21.5</version>
    </dependency>
  </dependencies>
</project>
```

### src/com/example/day4/User.java

<!-- file: src/com/example/day4/User.java -->

```java
package com.example.day4;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;

public final class User {
    private final Long id;
    private final String name;
    private final String email;
    private final List<String> skills;

    public User(Long id, String name, String email, List<String> skills) {
        if (id == null || id <= 0) throw new IllegalArgumentException("id 必须是正整数");
        this.id = id;
        this.name = requireText(name, "name");
        this.email = requireText(email, "email").toLowerCase();
        this.skills = List.copyOf(new LinkedHashSet<>(Objects.requireNonNull(skills, "skills 不能为 null")));
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(field + " 不能为空");
        return value.trim();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public List<String> getSkills() { return skills; }

    @Override
    public String toString() {
        return id + ":" + name + skills;
    }
}
```

### src/com/example/day4/UserRepository.java

<!-- file: src/com/example/day4/UserRepository.java -->

```java
package com.example.day4;

import java.util.List;

public interface UserRepository {
    void save(User user);
    List<User> findAll();
    void clear();
}
```

### src/com/example/day4/InMemoryUserRepository.java

<!-- file: src/com/example/day4/InMemoryUserRepository.java -->

```java
package com.example.day4;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class InMemoryUserRepository implements UserRepository {
    private final Map<Long, User> users = new LinkedHashMap<>();

    @Override
    public void save(User user) {
        users.put(user.getId(), user);
    }

    @Override
    public List<User> findAll() {
        return List.copyOf(users.values());
    }

    @Override
    public void clear() {
        users.clear();
    }
}
```

### src/com/example/day4/UserSnapshot.java

<!-- file: src/com/example/day4/UserSnapshot.java -->

```java
package com.example.day4;

import java.util.List;

public record UserSnapshot(Long id, String name, String email, List<String> skills) {
    public UserSnapshot {
        skills = skills == null ? List.of() : List.copyOf(skills);
    }

    public static UserSnapshot from(User user) {
        return new UserSnapshot(user.getId(), user.getName(), user.getEmail(), user.getSkills());
    }

    public User toUser() {
        return new User(id, name, email, skills);
    }
}
```

### src/com/example/day4/UserBackup.java

<!-- file: src/com/example/day4/UserBackup.java -->

```java
package com.example.day4;

import java.util.List;

public record UserBackup(int schemaVersion, List<UserSnapshot> users) {
    public static final int CURRENT_SCHEMA_VERSION = 1;

    public UserBackup {
        users = users == null ? List.of() : List.copyOf(users);
    }

    public static UserBackup current(List<UserSnapshot> users) {
        return new UserBackup(CURRENT_SCHEMA_VERSION, users);
    }
}
```

### src/com/example/day4/UserBackupStore.java

<!-- file: src/com/example/day4/UserBackupStore.java -->

```java
package com.example.day4;

import java.util.Optional;

public interface UserBackupStore {
    void write(UserBackup backup);
    Optional<UserBackup> read();
}
```

### src/com/example/day4/UserStorageException.java

<!-- file: src/com/example/day4/UserStorageException.java -->

```java
package com.example.day4;

public final class UserStorageException extends RuntimeException {
    public UserStorageException(String message) {
        super(message);
    }

    public UserStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

### src/com/example/day4/JacksonUserBackupStore.java

<!-- file: src/com/example/day4/JacksonUserBackupStore.java -->

```java
package com.example.day4;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Optional;

public final class JacksonUserBackupStore implements UserBackupStore {
    private final Path target;
    private final ObjectMapper objectMapper;

    public JacksonUserBackupStore(Path target) {
        this(target, new ObjectMapper());
    }

    JacksonUserBackupStore(Path target, ObjectMapper objectMapper) {
        this.target = target.toAbsolutePath().normalize();
        this.objectMapper = objectMapper;
    }

    @Override
    public Optional<UserBackup> read() {
        if (Files.notExists(target)) return Optional.empty();

        try (BufferedReader reader = Files.newBufferedReader(target, StandardCharsets.UTF_8)) {
            UserBackup backup = objectMapper.readValue(reader, UserBackup.class);
            if (backup.schemaVersion() != UserBackup.CURRENT_SCHEMA_VERSION) {
                throw new UserStorageException(
                        "不支持的 schemaVersion: " + backup.schemaVersion(),
                        new IllegalArgumentException(
                                "expected=" + UserBackup.CURRENT_SCHEMA_VERSION
                                        + ", actual=" + backup.schemaVersion()
                        )
                );
            }
            return Optional.of(backup);
        } catch (UserStorageException exception) {
            throw exception;
        } catch (IOException exception) {
            throw new UserStorageException("读取用户备份失败: " + target, exception);
        }
    }

    @Override
    public void write(UserBackup backup) {
        Path parent = target.getParent();
        Path temporary = null;

        try {
            Files.createDirectories(parent);
            temporary = Files.createTempFile(parent, target.getFileName() + ".", ".tmp");

            try (BufferedWriter writer = Files.newBufferedWriter(
                    temporary, StandardCharsets.UTF_8)) {
                objectMapper.writerWithDefaultPrettyPrinter().writeValue(writer, backup);
            }

            replaceTarget(temporary);
            temporary = null;
        } catch (IOException exception) {
            throw new UserStorageException("写入用户备份失败: " + target, exception);
        } finally {
            if (temporary != null) {
                try {
                    Files.deleteIfExists(temporary);
                } catch (IOException ignored) {
                    // 主异常优先；生产系统应记录清理失败日志。
                }
            }
        }
    }

    private void replaceTarget(Path temporary) throws IOException {
        try {
            Files.move(
                    temporary,
                    target,
                    StandardCopyOption.ATOMIC_MOVE,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (AtomicMoveNotSupportedException exception) {
            Files.move(temporary, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }
}
```

### src/com/example/day4/UserBackupService.java

<!-- file: src/com/example/day4/UserBackupService.java -->

```java
package com.example.day4;

import java.util.ArrayList;
import java.util.List;

public final class UserBackupService {
    private final UserRepository repository;
    private final UserBackupStore store;

    public UserBackupService(UserRepository repository, UserBackupStore store) {
        this.repository = repository;
        this.store = store;
    }

    public void backup() {
        List<UserSnapshot> snapshots = new ArrayList<>();
        for (User user : repository.findAll()) {
            snapshots.add(UserSnapshot.from(user));
        }
        store.write(UserBackup.current(snapshots));
    }

    public int restore() {
        var backupOptional = store.read();
        if (backupOptional.isEmpty()) return 0;
        UserBackup backup = backupOptional.orElseThrow();

        repository.clear();
        for (UserSnapshot snapshot : backup.users()) {
            repository.save(snapshot.toUser());
        }
        return backup.users().size();
    }
}
```

### src/com/example/day4/App.java

<!-- file: src/com/example/day4/App.java -->

```java
package com.example.day4;

import java.nio.file.Path;
import java.util.List;

public final class App {
    public static void main(String[] args) {
        Path path = args.length == 0 ? Path.of("data/users.json") : Path.of(args[0]);
        InMemoryUserRepository source = new InMemoryUserRepository();
        source.save(new User(1L, "Alice", "alice@example.com", List.of("Java", "TypeScript")));
        source.save(new User(2L, "Bob", "bob@example.com", List.of("Java", "Vue")));

        new UserBackupService(source, new JacksonUserBackupStore(path)).backup();

        InMemoryUserRepository restored = new InMemoryUserRepository();
        int count = new UserBackupService(restored, new JacksonUserBackupStore(path)).restore();

        System.out.println("备份文件: " + path.getFileName());
        System.out.println("恢复数量: " + count);
        System.out.println("恢复用户: " + restored.findAll());
    }
}
```

### src/com/example/day4/Verification.java

<!-- file: src/com/example/day4/Verification.java -->

```java
package com.example.day4;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public final class Verification {
    public static void main(String[] args) throws Exception {
        Path directory = Files.createTempDirectory("day4-verification-");
        Path target = directory.resolve("users.json");
        JacksonUserBackupStore store = new JacksonUserBackupStore(target);

        System.out.println("缺失文件: " + store.read());

        Files.writeString(target, "{ broken", StandardCharsets.UTF_8);
        printFailure("损坏 JSON", store::read);

        Files.writeString(
                target,
                """
                {"schemaVersion":2,"users":[]}
                """,
                StandardCharsets.UTF_8
        );
        printFailure("未知版本", store::read);

        Path impossibleTarget = directory.resolve("cannot-replace");
        Files.createDirectories(impossibleTarget);
        Files.writeString(impossibleTarget.resolve("keep.txt"), "keep");
        JacksonUserBackupStore failingStore = new JacksonUserBackupStore(impossibleTarget);
        printFailure(
                "写入失败",
                () -> failingStore.write(UserBackup.current(List.of()))
        );

        long temporaryFiles;
        try (var files = Files.list(directory)) {
            temporaryFiles = files
                    .filter(path -> path.getFileName().toString().endsWith(".tmp"))
                    .count();
        }
        System.out.println("残留临时文件: " + temporaryFiles);
    }

    private static void printFailure(String label, Runnable action) {
        try {
            action.run();
            System.out.println(label + ": 未抛异常（错误）");
        } catch (UserStorageException exception) {
            String cause = exception.getCause() == null
                    ? "无底层 cause"
                    : exception.getCause().getClass().getSimpleName();
            System.out.println(label + ": " + exception.getMessage());
            System.out.println(label + " cause: " + cause);
        }
    }
}
```

### A.13 依赖与运行说明

Maven 可用时执行 `mvn clean package`。当前验证机没有 Maven，因此使用从 Maven Central 获取的 `jackson-databind 2.21.5`、`jackson-core 2.21.5`、`jackson-annotations 2.21`，再用 JDK 21 的 `javac --release 21` 编译。该结果只代表源码、POM XML 和依赖组合已验证，不宣称本机执行过 Maven 生命周期。
