import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should update an order", async () => {
    //arrange
    const customerRepository = new CustomerRepository();
    const customer = new Customer("432", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("432", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("432", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    //act
    const orderItemTwo = new OrderItem(
      "3",
      product.name,
      product.price,
      product.id,
      2
    );

    const orderItems = [orderItemTwo].concat(order.items);
    const newOrder = new Order(order.id, order.customerId, orderItems);
    await orderRepository.update(newOrder);

    //assert
    const orderFound= await orderRepository.find(order.id);
      
    expect(orderFound).toStrictEqual(newOrder);

  });

  it("should find an order", async () => {
    //arrange
    const customerRepository = new CustomerRepository();
    const customer = new Customer("432", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("432", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("432", "432", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);
    //
    //act
    const orderFound = await orderRepository.find("432");

    //assert
    expect(orderFound).toStrictEqual(order);
    
  });

  it("should find all orders", async () => {
    //arrange pt1
    const customerRepository = new CustomerRepository();
    const customer = new Customer("432", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("432", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("432", "432", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);
    
    //act pt1
    const orderFound = await orderRepository.findAll();

    //assert pt1
    expect(orderFound).toStrictEqual([order]);
    
    //arrange pt2
    const orderItemTwo = new OrderItem(
      "2",
      product.name,
      product.price,
      product.id,
      3
    );
    const orderItemThree = new OrderItem(
      "3",
      product.name,
      product.price,
      product.id,
      4
    );

    const orderTwo = new Order("433", "432", [orderItemTwo, orderItemThree]);
    await orderRepository.create(orderTwo);

    //
    //act pt2
    const ordersFound = await orderRepository.findAll();

    //assert pt2
    expect(ordersFound).toStrictEqual([order, orderTwo]);
  });
});
