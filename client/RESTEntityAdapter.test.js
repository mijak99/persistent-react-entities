
const { RESTEntityAdapter } = require('./RESTEntityAdapter')

const Order = new RESTEntityAdapter("Order");
const OrderLine = new RESTEntityAdapter("OrderLine");

it('shall make it here', () => {
    expect(Order.type).toBe('Order')
});