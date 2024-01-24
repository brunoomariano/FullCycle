import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    try {
      const orderModel = await OrderModel.findOne({
        where: { id: entity.id },
        include: [OrderItemModel],
      });

      if (!orderModel) {
        throw new Error("Order not found");
      }

      orderModel.customer_id = entity.customerId;
      orderModel.total = entity.total();

      if (entity.items) {
        await OrderItemModel.destroy({
          where: {
            order_id: orderModel.id,
          },
        });

        const newItems = entity.items.map((item) => ({
          order_id: orderModel.id,
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        }));

        await OrderItemModel.bulkCreate(newItems);
      }
      await orderModel.save();
    } catch (error) {
      throw new Error(`Failed to update order: ${error}`);
    }
  }

  async find(id: string): Promise<Order> {
    const orderModel = await OrderModel.findOne({
      where: { id },
      include: ["items"],
    });

    if (!orderModel) {
      throw new Error("Order not found");
    }

    const order = new Order(
      orderModel.id,
      orderModel.customer_id,
      orderModel.items.map(
        (item) =>
          new OrderItem(
            item.id,
            item.name,
            item.price,
            item.product_id,
            item.quantity
          )
      )
    );

    return order;
  }

  async findAll(): Promise<Order[]> {
    const orderModel = await OrderModel.findAll({
      include: ["items"],
    });

    if (!orderModel) {
      throw new Error("Order not found");
    }

    const orders = orderModel.map(
      (order) =>
        new Order(
          order.id,
          order.customer_id,
          order.items.map(
            (item) =>
              new OrderItem(
                item.id,
                item.name,
                item.price,
                item.product_id,
                item.quantity
              )
          )
        )
    );

    return orders;
  }
}
