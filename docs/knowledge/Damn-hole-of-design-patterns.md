# Design Patterns-设计模式

> 该部分的内容翻译自[design-patterns-for-humans](https://github.com/kamranahmedse/design-patterns-for-humans#creational-design-patterns)，其中代码实现由php改为typescript编写，具体代码可以看[knowledge-works](https://github.com/james-cain/knowledge-works/tree/master/design-patterns)

设计模式是为了解决反复出现的问题而存在的，是作为如何解决确定问题的指导方针。它们并不是像传统的工具库那样直接引入到引用就会有神奇的事情发生。只是作为解决问题的一种合理方案。

> 在维基百科中是这么描述的：软件工程中，软件设计模式是在给定的软件设计上下文里，对于普遍出现的问题的一个可重用的解决方案。它并不是转换准确源码或者机器语言的最终设计。它只是作为一个如何解决被使用在不同情况中问题的描述或模板。

## 设计模式类型

- Creational Design Patterns

  > 创建模式专注于如何初始化对象或相关联对象组

  - Simple Factory - 简单工厂

    > 简单工厂就是为使用者生成一个不暴露任何创建逻辑的实例

    维基百科：

    > 在面向对象编程中(OOP)，工厂即一个创建别的对象的对象 - 工厂通常是一个返回对象或class的函数或方法，被定义为"new"

    何时使用？

    当需要创建对象会包含一些逻辑时，把这些重复的代码由专用的工厂代替会变得很有意义

    示例：

    ```typescript
    interface Door {
      getWidth();
      getHeight();
    }
    
    class WoodenDoor implements Door {
      protected width;
      protected height;
    
      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
      }
    
      getWidth() {
        return this.width;
      }
    
      getHeight() {
        return this.height;
      }
    }
    
    class DoorFactory {
      static makeDoor(width, height) {
        return new WoodenDoor(width, height);
      }
    }
    
    const door = DoorFactory.makeDoor(100, 200);
    door.getWidth(); // 100
    door.getHeight(); // 200
    ```

  - Factory Method - 工厂方法

    > 工厂方法提供了一个委派实例逻辑给child classes的方式

    维基百科：

    > 工厂方法模式是使用一些工厂方法来处理创建对象问题，没有指定准确的需要被创建的类。创建对象通过调用工厂方法(指定接口由child类实现或实现一个基础类通过派生类选择性的覆盖)来完成，而不是直接调用构造函数

    何时使用？

    在类中，存在通用的处理且必要的子类是在运行时动态决定情况下很有用。或者换句话说，使用者不知道子类如何准确的执行时。

    示例：

    ```typescript
    interface Interviewer {
      askQuestions();
    }
    
    class Developer implements Interviewer {
      askQuestions() {
        console.log('Asking about design patterns!');
      }
    }
    
    class CommunityExecutive implements Interviewer {
      askQuestions() {
        console.log('Asking about community building!');
      }
    }
    
    abstract class HiringManager {
      interviewer;
    
      // Factory method
      protected abstract makeInterviewer(): Interviewer;
    
      takeInterview() {
        this.interviewer = this.makeInterviewer();
        this.interviewer.askQuestions();
      }
    }
    
    class DevelopmentManager extends HiringManager {
      protected makeInterviewer(): Interviewer {
        return new Developer();
      }
    }
    
    class MarketingManager extends HiringManager {
      protected makeInterviewer(): Interviewer {
        return new CommunityExecutive();
      }
    }
    
    let devManager = new DevelopmentManager();
    devManager.takeInterview(); // Asking about design patterns!
    
    let marketingManager = new MarketingManager();
    marketingManager.takeInterview(); // Asking about community building!
    ```

  - Abstract Factory - 抽象工厂

    > 抽象工厂即工厂的工厂；将独立的但相关/依赖的工厂分组在一起，不指定其具体类的工厂的工厂

    维基百科：

    > 抽象工厂模式提供一个方式-封装独立的带有通用主题不指定具体类的工厂分组

    示例：

    ```typescript
    // Door interface and implements for it
    interface Door {
      getDescription();
    }
    
    class WoodenDoor implements Door {
      getDescription() {
        console.log('I am a wooden door');
      }
    }
    
    class IronDoor implements Door {
      getDescription() {
        console.log('I am an iron door');
      }
    }
    
    // fitting experts for each door type
    interface DoorFittingExpert {
      getDescription();
    }
    
    class Welder implements DoorFittingExpert {
      getDescription() {
        console.log('I can only fit iron doors');
      }
    }
    
    class Carpenter implements DoorFittingExpert {
      getDescription() {
        console.log('I can only fit wooden doors');
      }
    }
    
    // abstract factory
    interface DoorFactory {
      makeDoor(): Door;
      mekeFittingExpert(): DoorFittingExpert;
    }
    
    class WoodenDoorFactory implements DoorFactory {
      makeDoor(): Door {
        return new WoodenDoor();
      }
      
      mekeFittingExpert(): DoorFittingExpert {
        return new Carpenter();
      }
    }
    
    class IronDoorFactory implements DoorFactory {
      makeDoor(): Door {
        return new IronDoor();
      }
    
      mekeFittingExpert(): DoorFittingExpert {
        return new Welder();
      }
    }
    
    let woodenFactory = new WoodenDoorFactory();
    let door = woodenFactory.makeDoor();
    let expert = woodenFactory.mekeFittingExpert();
    door.getDescription(); // I am a wooden door
    expert.getDescription(); // I can only fit wooden doors
    
    let ironFactory = new IronDoorFactory();
    let ironDoor = ironFactory.makeDoor();
    let ironExpert = ironFactory.mekeFittingExpert();
    ironDoor.getDescription(); // I am an iron door
    ironExpert.getDescription(); // I can only fit iron doors
    ```

  - Builder - 生成器

    > 允许创建不同风格的对象，同时避免构造函数污染。当一个对象可以有多种风格时，该模式将很有用，或在创建对象时涉及很多步骤

    维基百科：

    > 生成器模式是一种对象创建软件涉及模式，其目的是找到可伸缩构造函数反模式的解决方案

    何时使用？

    当对象带有多种风格且阻止构造函数参数叠加。生成器模式和工厂模式不同的关键点在于工厂模式创建过程只有一步，而生成器模式由多步完成

    示例：

    ```typescript
    class Burger {
      protected size;
      protected cheese = false;
      protected pepperoni = false;
      protected lettuce = false;
      protected tomato = false;
    
      constructor(builder: BurgerBuilder) {
        this.size = builder.size;
        this.cheese = builder.cheese;
        this.pepperoni = builder.pepperoni;
        this.lettuce = builder.lettuce;
        this.tomato = builder.tomato;
      }
    
      run() {
        console.log(`size: ${this.size}
        cheese: ${this.cheese}
        pepperoni: ${this.pepperoni}
        lettuce: ${this.lettuce}
        tomato: ${this.tomato}`);
      }
    }
    
    class BurgerBuilder {
      size;
      cheese = false;
      pepperoni = false;
      lettuce = false;
      tomato = false;
    
      constructor(size: number) {
        this.size = size;
      }
    
      addPepperoni() {
        this.pepperoni = true;
        return this;
      }
    
      addLettuce() {
        this.lettuce = true;
        return this;
      }
    
      addCheese() {
        this.cheese = true;
        return this;
      }
    
      addTomato() {
        this.tomato = true;
        return this;
      }
    
      build(): Burger {
        return new Burger(this);
      }
    }
    
    let burger = (new BurgerBuilder(14))
      .addPepperoni()
      .addLettuce()
      .addTomato()
      .build();
    
    burger.run();
    // size: 14
    // cheese: false
    // pepperoni: true
    // lettuce: true
    // tomato: true
    ```

  - Prototype - 原型模式

    > 通过克隆的方式以已经存在的对象为基础创建对象

    维基百科：

    > 原型模式是一种软件开发生成器模式。当要创建的对象类型由一个原型实例决定时，将使用它，该原型实例被克隆以生成新的对象

    JavaScript就是基于原型的模式创建对象，拷贝也分为两种，深拷贝和浅拷贝。若要拷贝一个完全独立内存的对象，必须使用深拷贝

    ```js
    const deepClone = obj => {
      let clone = Object.assign({}, obj);
      Object.keys(clone).forEach(
        key => (clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key])
      );
      return Array.isArray(obj) && obj.length ?
        (clone.length = obj.length) && Array.from(clone) :
          Array.isArray(obj) ?
            Array.from(obj) :
              clone;
    };
    
    const a = { foo: 'bar', obj: { a: 1, b: 2 } };
    const b = deepClone(a);
    console.log(b); // { foo: 'bar', obj: { a: 1, b: 2 } }
    ```

  - Singleton - 单例模式

    > 确保类只有一个实例被创建

    维基百科：

    > 在软件工程，单例模式限制类的实例化。对于需要在系统中保持行为一致性的对象来说是很有用的

    示例：

    ```typescript
    class President {
      static instance;
    
      constructor() {
        // Hide the constructor
      }
    
      static getInstance(): President {
        if (!President.instance) {
          President.instance = new President();
        }
        return President.instance;
      }
    }
    
    let president1 = President.getInstance();
    let president2 = President.getInstance();
    
    console.log(president1 === president2); // true
    ```

- Structural Design Patterns

  > 结构模式最关注的是对象组成或理解为一个整体是如何通过每一个构建组成的

  维基百科：

  > 在软件工程中，结构设计模式是通过识别一种实现实体之间关系的简单方法来简化设计的设计模式

  - Adapter - 适配器

    > 适配器模式让使用者将原来不兼容的对象包装在适配器中，使其与另一个类兼容

    维基百科：

    > 在软件工程中，适配器模式是一种软件设计模式，它允许将现有类的接口用作另一个接口。它通常用于使现有类在不修改源代码的情况下与其他类一起工作

    示例：

    ```typescript
    interface Lion {
      roar();
    }
    
    class AfricanLion implements Lion {
      roar() {}
    }
    
    class AsianLion implements Lion {
      roar() {}
    }
    
    class Hunter {
      hunt(lion: Lion) {
        lion.roar();
      }
    }
    
    // 在现有的基础上，添加WildDog类，但dog准确上说是属于不同的接口
    // 为了适配现有的hunter，要创建一个适配器来兼容
    class WildDog {
      bark() {
        console.log('bark~');
      }
    }
    
    // 适配WildDog让其兼容
    class WildDogAdapter implements Lion {
      protected dog;
    
      constructor(dog: WildDog) {
        this.dog = dog;
      }
    
      roar() {
        this.dog.bark();
      }
    }
    
    // 现在WildDog就可以使用WildDogAdapter类适配规则
    let wildDog = new WildDog();
    let wildDogAdapter = new WildDogAdapter(wildDog);
    
    let hunter = new Hunter();
    hunter.hunt(wildDogAdapter); // bark~
    ```

  - Bridge - 桥接

    > 桥接模式是关于优先选择组合而不是继承。实现细节从一个层次结构推送到另一个具有独立层次结构的对象

    维基百科：

    > 桥接模式是软件工程中使用的一种设计模式，其目的是"将抽象与其实现解耦，以便两者可以独立地变化"

    ![bridge_pattern.png](http://reyshieh.com/assets/bridge_pattern.png)

    示例：

    ```typescript
    interface WebPage {
      getContent();
    }
    
    class About implements WebPage {
      protected theme;
    
      constructor(theme: Theme) {
        this.theme = theme;
      }
    
      getContent() {
        return `About page in ${this.theme.getColor()}`;
      }
    }
    
    class Careers implements WebPage {
      protected theme;
    
      constructor(theme: Theme) {
        this.theme = theme;
      }
    
      getContent() {
        return `Careers page in ${this.theme.getColor()}`;
      }
    }
    
    // 解耦后的theme层级
    interface Theme {
      getColor();
    }
    
    class DarkTheme implements Theme {
      getColor() {
        return 'Dark Black';
      }
    }
    
    class LightTheme implements Theme {
      getColor() {
        return 'Off white';
      }
    }
    
    class AquaTheme implements Theme {
      getColor() {
        return 'Lightblue';
      }
    }
    
    let darkTheme = new DarkTheme();
    
    let about = new About(darkTheme);
    let careers = new Careers(darkTheme);
    
    console.log(about.getContent()); // About page in Dark Black
    console.log(careers.getContent()); // Careers page in Dark Black
    ```

  - composite - 组成

    > 组成模式允许用户以统一的方式处理各个对象

    维基百科：

    > 在软件工程中，组成模式是一个分区设计模式。组成模式描述了将以与对象的单个实例相同的方式处理一组对象。组合的目的是将对象"组合"到树结构中，以表示部分-整体层次结构。实现组合模式可以让客户机统一地处理单个对象和组合

    示例：

    ```typescript
    // 该例实际和Bridge示例十分相似
    interface EmployeeConstructor {
      new (name: string, salary: number): Employee;
    }
    
    interface Employee {
      getName(): string;
      setSalary(salary: number);
      getSalary(): number;
      getRoles(): [];
    }
    
    function creatEmployee(cEmp: EmployeeConstructor, name: string, salary: number): Employee {
      return new cEmp(name, salary);
    }
    
    class Developer implements Employee {
      protected salary;
      protected name;
      protected roles;
    
      constructor(name: string, salary: number) {
        this.name = name;
        this.salary = salary;
      }
    
      getName(): string {
        return this.name;
      }
    
      setSalary(salary: number) {
        this.salary = salary;
      }
    
      getSalary(): number {
        return this.salary;
      }
    
      getRoles(): [] {
        return this.roles;
      }
    }
    
    class Organization {
      protected employees: Employee[] = [];
    
      addEmployee(employee: Employee) {
        this.employees.push(employee);
      }
    
      getNetSalaries(): number {
        let netSalary = 0;
    
        this.employees.forEach(emp => {
          netSalary += emp.getSalary();
        });
    
        return netSalary;
      }
    }
    
    let john = creatEmployee(Developer, 'John Doe', 12000);
    let jane = creatEmployee(Developer, 'Jane Doe', 15000);
    
    let organization = new Organization();
    organization.addEmployee(john);
    organization.addEmployee(jane);
    
    console.log(`Net salaries: ${organization.getNetSalaries()}`); // Net salaries: 27000
    ```

  - Decorator - 装饰者

    > 装饰者模式让用户在运行时通过将对象包装在装饰类的对象中来动态地改变对象行为

    维基百科：

    > 在面向对象编程中，装饰者模式是一个设计模式，允许添加行为给一个独立对象，无论是静态或动态，不影响同类中别的对象行为

    示例：

    ```typescript
    interface Coffee {
      getCost();
      getDescription();
    }
    
    class SimpleCoffee implements Coffee {
      getCost() {
        return 10;
      }
    
      getDescription() {
        return 'Simple coffee';
      }
    }
    
    // 接下来添加decorators，允许按需修改属性
    class MilkCoffee implements Coffee {
      protected coffee;
    
      constructor(coffee: Coffee) {
        this.coffee = coffee;
      }
    
      getCost() {
        return this.coffee.getCost() + 2;
      }
    
      getDescription() {
        return `${this.coffee.getDescription()}, milk`;
      }
    }
    
    class WhipCoffee implements Coffee {
      protected coffee;
    
      constructor(coffee: Coffee) {
        this.coffee = coffee;
      }
    
      getCost() {
        return this.coffee.getCost() + 5;
      }
    
      getDescription() {
        return `${this.coffee.getDescription()}, whip`;
      }
    }
    
    class VanillaCoffee implements Coffee {
      protected coffee;
    
      constructor(coffee: Coffee) {
        this.coffee = coffee;
      }
    
      getCost() {
        return this.coffee.getCost() + 3;
      }
    
      getDescription() {
        return `${this.coffee.getDescription()}, vanilla`;
      }
    }
    
    let someCoffee = new SimpleCoffee();
    console.log(someCoffee.getCost()); // 10
    console.log(someCoffee.getDescription()); // Simple coffee
    
    someCoffee = new MilkCoffee(someCoffee);
    console.log(someCoffee.getCost()); // 12
    console.log(someCoffee.getDescription()); // Simple coffee, milk
    
    someCoffee = new WhipCoffee(someCoffee);
    console.log(someCoffee.getCost()); // 17
    console.log(someCoffee.getDescription()); // Simple coffee, milk, whip
    
    someCoffee = new VanillaCoffee(someCoffee);
    console.log(someCoffee.getCost()); // 20
    console.log(someCoffee.getDescription()); // Simple coffee, milk, whip, vanilla
    ```

  - Facade - 外观

    > 外观模式为复杂子系统提供简单的接口

    维基百科：

    > 外观是一个对象，它为更大的代码体，如类库，提供了一个简化的接口

    示例：

    ```typescript
    class Computer {
      getElectricShock() {
        console.log('Ouch');
      }
    
      makeSound() {
        console.log('Beep beep!');
      }
    
      showLoadingScreen() {
        console.log('Loading..');
      }
    
      bam() {
        console.log('Ready to be used!');
      }
    
      closeEverything() {
        console.log('Bup bup bup buzzzz!');
      }
    
      sooth() {
        console.log('Zzzzz');
      }
    
      pullCurrent() {
        console.log('Haaah');
      }
    }
    
    // facade
    class ComputerFacade {
      protected computer;
    
      constructor(computer: Computer) {
        this.computer = computer;
      }
    
      turnOn() {
        this.computer.getElectricShock();
        this.computer.makeSound();
        this.computer.showLoadingScreen();
        this.computer.bam();
      }
    
      turnOff() {
        this.computer.closeEverything();
        this.computer.pullCurrent();
        this.computer.sooth();
      }
    }
    
    // 使用facade
    let computer = new ComputerFacade(new Computer());
    computer.turnOn();
    // Ouch
    // Beep beep!
    // Loading..
    // Ready to be used!
    computer.turnOff();
    // Bup bup bup buzzzz!
    // Haaah
    // Zzzzz
    ```

  - Flyweight - 享元

    > 享元模式是一种软件开发中的设计模式，其主要解决的问题是通过类对象的共享，来避免大量创建拥有相同内容的对象的开销

    维基百科：

    > 在计算机编程中，享元是一个软件设计模式。享元是一个通过与其他类似对象共享尽可能多的数据来最小化内存使用的对象；当一个简单的重复表示将使用不可接受的内存量时，它是一种大量使用对象的方法

    示例：

    ```typescript
    class KarakTea {
    
    }
    
    // flyweight 用数组存储已经创建的对象，不过度创建
    class TeaMaker {
      protected availableTea = [];
    
      make(preference) {
        if (!this.availableTea[preference]) {
          this.availableTea[preference] = new KarakTea();
        }
    
        return this.availableTea[preference];
      }
    }
    
    class TeaShop {
      protected orders = [];
      protected teaMaker;
    
      constructor(teaMaker: TeaMaker) {
        this.teaMaker = teaMaker;
      }
    
      takeOrder(teaType: string, table: number) {
        this.orders[table] = this.teaMaker.make(teaType);
      }
    
      serve() {
        this.orders.forEach((order, index) => {
          console.log(`Serving tea to table#${index}`);
        });
      }
    }
    
    let teaMaker = new TeaMaker();
    let shop = new TeaShop(teaMaker);
    
    shop.takeOrder('less sugar', 1);
    shop.takeOrder('more milk', 2);
    shop.takeOrder('without sugar', 5);
    
    shop.serve();
    // Serving tea to table#1
    // Serving tea to table#2
    // Serving tea to table#5
    ```

  - Proxy - 代理

    > 使用代理模式，类表示另一个类的功能

    维基百科：

    > 代理，在其最一般的形式中，是一个类，它的功能是作为其他类的接口。代理是一个包装器或代理对象，客户机调用它来访问幕后的实际服务对象。代理的使用可以简单地转发到实际对象，也可以提供额外的逻辑。在代理中，可以提供额外的功能，例如，在实际对象上的操作是资源密集型操作时进行缓存，或者在调用实际对象上的操作之前检查先决条件。

    示例：

    ```typescript
    interface Door {
      open();
      close();
    }
    
    class LabDoor implements Door {
      open() {
        console.log('Opening lab door');
      }
    
      close() {
        console.log('closing the lab door');
      }
    }
    
    // 创建proxy
    class SecureDoor {
      protected door;
    
      constructor(door: Door) {
        this.door = door;
      }
    
      open(password) {
        if (this.authenticate(password)) {
          this.door.open();
        } else {
          console.log('Big no ! It ain\'t possible.');
        }
      }
    
      authenticate(password) {
        return password === '$ecr@t';
      }
    
      close() {
        this.door.close();
      }
    }
    
    let door = new SecureDoor(new LabDoor());
    door.open('invalid'); // Big no ! It ain't possible.
    door.open('$ecr@t'); // Opening lab door
    door.close(); // closing the lab door
    ```

- Behavioral Design Patterns

  > 行为设计模式关注于对象之间的责任分配。它们与结构化设计模式的不同之处在于，它们不仅要指定结构，还概述了它们之间的消息传递/通信模式。换句话说，它们帮助回答了"如何在软件组件中运行行为？"

  维基百科：

  > 在软件工程中，行为设计模式是识别对象之间的公共通信模式并实现这些模式的设计模式。通过这样做，这些模式增加了执行此通信的灵活性。

  - Chain of Responsibility - 责任链

    > 责任链模式有助于构建对象链。请求从一端进入，从一个对象进入另一个对象，直到找到合适的处理程序

    维基百科：

    > 在面向对象设计中，责任链模式是一种由命令对象源和一系列处理对象组成的设计模式。每个处理对象都包含定义它可以处理的命令对象类型的逻辑;其余的传递给链中的下一个处理对象。

    示例：

    ```typescript
    abstract class Account {
      protected successor;
      protected balance;
    
      // 设置责任链对象
      setNext(account: Account) {
        this.successor = account;
      }
    
      pay(amountToPay: number) {
        if (this.canPay(amountToPay)) {
          console.log(`Paid ${amountToPay} by ${this.name}`);
        } else if (this.successor) {
          this.successor.pay(amountToPay);
        } else {
          console.error('None of the accounts have enough balance');
        }
      }
    
      canPay(amount): boolean {
        return this.balance >= amount;
      }
    }
    
    class Bank extends Account {
      protected balance;
      name = 'Bank';
    
      constructor(balance: number) {
        super();
        this.balance = balance;
      }
    }
    
    class Paypal extends Account {
      protected balance;
      name = 'Paypal';
    
      constructor(balance: number) {
        super();
        this.balance = balance;
      }
    }
    
    class Bitcoin extends Account {
      protected balance;
      name = 'Bitcoin';
    
      constructor(balance: number) {
        super();
        this.balance = balance;
      }
    }
    
    // 自定义责任链，链式顺序为bank -> paypal -> bitcoin
    let bank = new Bank(100);
    let paypal = new Paypal(200);
    let bitcoin = new Bitcoin(300);
    
    bank.setNext(paypal);
    paypal.setNext(bitcoin);
    
    bank.pay(218); // Paid 218 by Bitcoin
    ```

  - Command - 命令

    > 命令模式允许在对象中封装操作，该模式背后的关键思想是提供将客户机与接收器解耦的方法

    维基百科：

    > 在面向对象编程中，命令模式是一种行为设计模式，在这种模式中，对象被用来封装执行某个操作或在稍后某个事件所需的所有信息。这些信息包括方法名、拥有方法的对象和方法参数的值

    示例：

    ```typescript
    // Receiver
    class Bulb {
      turnOn() {
        console.log('Bulb has been lit');
      }
    
      turnOff() {
        console.log('Darkness!');
      }
    }
    
    // Command接口
    interface Command {
      execute();
      undo();
      redo();
    }
    
    // Command
    class TurnOn implements Command {
      protected bulb;
    
      constructor(bulb: Bulb) {
        this.bulb = bulb;
      }
    
      execute() {
        this.bulb.turnOn();
      }
    
      undo() {
        this.bulb.turnOff();
      }
    
      redo() {
        this.execute();
      }
    }
    
    class TurnOff implements Command {
      protected bulb;
    
      constructor(bulb: Bulb) {
        this.bulb = bulb;
      }
    
      execute() {
        this.bulb.turnOff();
      }
    
      undo() {
        this.bulb.turnOn();
      }
    
      redo() {
        this.execute();
      }
    }
    
    // Invoker
    class RemoteControl {
      submit(command: Command) {
        command.execute();
      }
    }
    
    let bulb = new Bulb();
    let turnOn = new TurnOn(bulb);
    let turnOff = new TurnOff(bulb);
    
    let remote = new RemoteControl();
    remote.submit(turnOn); // Bulb has been lit
    remote.submit(turnOff); // Darkness!
    ```

  - Iterator - 迭代器

    > 迭代器模式提供一种访问对象元素而不暴露底层表示的方法

    维基百科：

    > 在面向对象编程中，迭代器模式是一种设计模式，其中迭代器用于遍历容器并访问容器的元素。迭代器模式将算法与容器解耦；在某些情况下，算法必须特定于容器，因此不能解耦

    示例：

    ```typescript
    
    ```

  - Mediator - 中介者

    > 中介者模式增加了一个第三方对象(称为中介者)来控制两个对象(称为同事)之间的交互。它有助于减少相互通信的类之间的耦合。因为现在他们不需要知道彼此的实现

    维基百科：

    > 在软件工程中，中介者模式定义一个对象，该对象封装了一组对象的交互方式。这种模式被认为是一种行为模式，因为它可以改变程序的运行行为

    示例：

    ```typescript
    interface ChatRoomMediator {
      showMessage(user: User, message: string);
    }
    
    // Mediator
    class ChatRoom implements ChatRoomMediator {
      showMessage(user: User, message: string) {
        let time = new Date();
        let sender = user.getName();
        console.log(`${time} [ ${sender} ]: ${message}`);
      }
    }
    
    // colleagues
    class User {
      protected name;
      protected chatMediator;
    
      constructor(name: string, chatMediator: ChatRoomMediator) {
        this.name = name;
        this.chatMediator = chatMediator;
      }
    
      getName() {
        return this.name;
      }
    
      send(message) {
        this.chatMediator.showMessage(this, message);
      }
    }
    
    let mediator = new ChatRoom();
    let john = new User('John Doe', mediator);
    let jane = new User('Jane Doe', mediator);
    
    john.send('Hi there!'); // Thu Feb 14 2019 10:05:25 GMT+0800 (CST) [ John Doe ]: Hi there!
    jane.send('Hey!'); // Thu Feb 14 2019 10:05:25 GMT+0800 (CST) [ Jane Doe ]: Hey!
    ```

  - Memento - 备忘录

    > 备忘录模式是一种捕获和存储对象当前状态的方式，这种方式可以在以后以一种平稳的方式恢复

    维基百科：

    > 备忘录模式是一种软件设计模式，它提供存储对象先前的状态的能力(撤销通过回滚)

    示例：

    ```typescript
    // memento
    class EditorMemento {
      protected content;
    
      constructor(content: string) {
        this.content = content;
      }
    
      getContent() {
        return this.content;
      }
    }
    
    class Editor {
      protected content = '';
    
      type(words) {
        this.content = this.content + ' ' + words;
      }
    
      getContent() {
        return this.content;
      }
    
      save() {
        return new EditorMemento(this.content);
      }
    
      restore(memento: EditorMemento) {
        this.content = memento.getContent();
      }
    }
    
    let editor = new Editor();
    
    editor.type('This is the first sentence.');
    editor.type('This is second.');
    
    let saved = editor.save();
    
    editor.type('And this is third.');
    
    console.log(editor.getContent()); // This is the first sentence. This is second. And this is third.
    
    editor.restore(saved);
    console.log(editor.getContent()); //  This is the first sentence. This is second.
    ```

  - Observer - 观察者

    > 观察者模式是在对象之间定义依赖关系，以便每当对象更改其状态时，都会通知其所有依赖关系

    维基百科：

    > 观察者模式是一个软件设计模式，在这种模式中，一个名为分类(subject)的对象维护其依赖项(称为观察者observer)的列表，并自动通知它们任何状态更改，通常是通过调用它们的一个方法

    示例：

    ```typescript
    class JobPost {
      protected title;
    
      constructor(title: string) {
        this.title = title;
      }
    
      getTitle() {
        return this.title;
      }
    }
    
    // observer
    class JobSeeker {
      protected name;
    
      constructor(name: string) {
        this.name = name;
      }
    
      onJobPosted(job: JobPost) {
        console.log(`Hi ${this.name}! New job posted: ${job.getTitle()}`);
      }
    }
    
    class EmploymentAgency {
      protected observers: JobSeeker[] = [];
    
      notify(jobPosting: JobPost) {
        this.observers.forEach(observer => {
          observer.onJobPosted(jobPosting);
        });
      }
    
      attach(observer: JobSeeker) {
        this.observers.push(observer);
      }
    
      addJob(jobPosting: JobPost) {
        // 每当得到Job信息，就通知observer
        this.notify(jobPosting);
      }
    }
    
    let johnDoe = new JobSeeker('John Doe');
    let janeDoe = new JobSeeker('Jane Doe');
    
    let jobPostings = new EmploymentAgency();
    jobPostings.attach(johnDoe);
    jobPostings.attach(janeDoe);
    
    jobPostings.addJob(new JobPost('Software Engineer'));
    // Hi John Doe! New job posted: Software Engineer
    // Hi Jane Doe! New job posted: Software Engineer
    ```

  - Visitor - 访问者

    > 访问者模式允许使用者向对象添加进一步的操作，而不必修改它们

    维基百科:

    > 在面向对象编程和软件工程中，访问者设计模式是一种将算法从其操作的对象结构中分离出来的方法。这种分离的一个实际结果是能够在不修改对象结构的情况下向其添加新操作。这是遵循开放/封闭原则的一种方式

    示例：

    ```typescript
    // Visitee
    interface Animal {
      accept(operation: AnimalOperation);
    }
    
    // Visitor
    interface AnimalOperation {
      visitMonkey(monkey: Monkey);
      visitLion(lion: Lion);
      visitDolphin(dolphin: Dolphin);
    }
    
    class Monkey implements Animal {
      shout() {
        console.log('Ooh oo aa aa !');
      }
    
      accept(operation: AnimalOperation) {
        operation.visitMonkey(this);
      }
    }
    
    class Lion implements Animal {
      shout() {
        console.log('Roaaar!');
      }
    
      accept(operation: AnimalOperation) {
        operation.visitLion(this);
      }
    }
    
    class Dolphin implements Animal {
      shout() {
        console.log('Tuut tuttu tuutt!');
      }
    
      accept(operation: AnimalOperation) {
        operation.visitDolphin(this);
      }
    }
    
    // 实现Visitor
    class Speak implements AnimalOperation {
      visitMonkey(monkey: Monkey) {
        monkey.shout();
      }
    
      visitLion(lion: Lion) {
        lion.shout();
      }
    
      visitDolphin(dolphin: Dolphin) {
        dolphin.shout();
      }
    }
    
    let monkey = new Monkey();
    let lion = new Lion();
    let dolphin = new Dolphin();
    
    let speak = new Speak();
    
    monkey.accept(speak); // Ooh oo aa aa !
    lion.accept(speak); // Roaaar!
    dolphin.accept(speak); // Tuut tuttu tuutt!
    
    // 现在我们可以在已有的基础上添加action，例如我们想知道每个动物的调高情况
    // 可以添加一个Jump类
    class Jump implements AnimalOperation {
      visitMonkey(monkey: Monkey) {
        console.log('Jumped 20 feet high! on to the tree!');
      }
    
      visitLion(lion: Lion) {
        console.log('Jumped 7 feet! Back on the ground');
      }
    
      visitDolphin(dolphin: Dolphin) {
        console.log('Walked on water a little and disappeared');
      }
    }
    
    let jump = new Jump();
    
    monkey.accept(jump); // Jumped 20 feet high! on to the tree!
    lion.accept(jump); // Jumped 7 feet! Back on the ground
    dolphin.accept(jump); // Walked on water a little and disappeared
    ```

  - Strategy - 策略

    > 策略模式允许使用者根据不同的情况切换算法或策略

    维基百科：

    > 在计算机编程中，策略模式是一种行为软件设计模式，它允许在运行时选择算法的行为

    示例：

    ```typescript
    interface SortStrategy {
      sort(dataset: any[]): any[];
    }
    
    class BubbleSortStrategy implements SortStrategy {
      sort(dataset: any[]): any[] {
        console.log('Sorting using bubble sort');
        return dataset;
      }
    }
    
    class QuickSortStrategy implements SortStrategy {
      sort(dataset: any[]): any[] {
        console.log('Sorting using quick sort');
        return dataset;
      }
    }
    
    class Sorter {
      protected sorter;
    
      constructor(sorter: SortStrategy) {
        this.sorter = sorter;
      }
    
      sort(dataset: any[]): any[] {
        return this.sorter.sort(dataset);
      }
    }
    
    let dataset = [1, 5, 3, 2, 5, 6];
    
    let sorter = new Sorter(new BubbleSortStrategy());
    sorter.sort(dataset); // Sorting using bubble sort
    
    sorter = new Sorter(new QuickSortStrategy());
    sorter.sort(dataset); // Sorting using quick sort
    ```

  - State - 状态

    > 当状态改变时，状态模式允许使用者转换类的行为

    维基百科:

    > 状态模式是一种以面向对象的方式实现状态机的行为软件设计模式。对于状态模式，通过将每个单独的状态实现为状态模式接口的派生类，并通过调用模式超类定义的方法实现状态转换，从而实现状态机。状态模式可以解释为策略模式，它能够通过调用模式接口中定义的方法来切换当前策略。

    示例：

    ```typescript
    // 个人觉得状态模式和策略模式相似
    interface WritingState {
      write(words: string);
    }
    
    // state
    class UpperCase implements WritingState {
      write(words: string) {
        console.log(words.toUpperCase());
      }
    }
    
    class LowerCase implements WritingState {
      write(words: string) {
        console.log(words.toLowerCase());
      }
    }
    
    class DefaultText implements WritingState {
      write(words: string) {
        console.log(words);
      }
    }
    
    class TextEditor {
      protected state;
    
      constructor(state: WritingState) {
        this.state = state;
      }
    
      setState(state: WritingState) {
        this.state = state;
      }
    
      type(words: string) {
        this.state.write(words);
      }
    }
    
    let editor = new TextEditor(new DefaultText());
    editor.type('First line'); // First line
    
    editor.setState(new UpperCase());
    editor.type('Second line'); // SECOND LINE
    editor.type('Third line'); // THIRD LINE
    
    editor.setState(new LowerCase());
    editor.type('Forth line'); // forth line
    editor.type('Fifth line'); // fifth line
    ```

  - Template Method - 模板方法

    > 模板方法模式定义了如何执行某个算法的骨架，但将这些步骤的实现顺延到子类中

    维基百科：

    > 在软件工程中，模板方法模式是一个行为设计模式，它定义了操作中的算法程序骨架，将某些步骤顺延到子类中。它允许重新定义算法的某些步骤但不改变算法的框架

    示例：

    ```typescript
    // 指定build算法的框架基类
    abstract class Builder {
      // Template method
      build() {
        this.test();
        this.lint();
        this.assembly();
        this.deploy();
      }
    
      abstract test();
      abstract lint();
      abstract assembly();
      abstract deploy();
    }
    
    class AndroidBuilder extends Builder {
      test() {
        console.log('Running android tests');
      }
    
      lint() {
        console.log('Linting the android code');
      }
    
      assembly() {
        console.log('Assemblying the android build');
      }
    
      deploy() {
        console.log('Deploying android build to server');
      }
    }
    
    class IosBuilder extends Builder {
      test() {
        console.log('Running ios tests');
      }
    
      lint() {
        console.log('Linting the ios code');
      }
    
      assembly() {
        console.log('Assemblying the ios build');
      }
    
      deploy() {
        console.log('Deploying ios build to server');
      }
    }
    
    let androidBuilder = new AndroidBuilder();
    androidBuilder.build();
    // Running android tests
    // Linting the android code
    // Assemblying the android build
    // Deploying android build to server
    
    let iosBuilder = new IosBuilder();
    iosBuilder.build();
    // Running ios tests
    // Linting the ios code
    // Assemblying the ios build
    // Deploying ios build to server
    ```






