import EventDispatcher from "../../@shared/event/event-dispatcher";
import FirstConsoleLogWhenCustomerItsCreatedHandler from "./handler/first-console-log-when-customer-its-created.handler";
import CustomerCreatedEvent from "./customer-created.event";
import SecondConsoleLogWhenCustomerItsCreatedHandler from "./handler/second-console-log-when-customer-its-created.handler";
import NotifyThatCustomerAddressChangedHandler from "./handler/notify-that-customer-address-changed.handler";
import CustomerAddressChangedEvent from "./customer-address-changed.event";

describe("Customer events tests", () => {
    it("should register an event handler", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new FirstConsoleLogWhenCustomerItsCreatedHandler();

        eventDispatcher.register("CustomerCreatedEvent", eventHandler);

        expect(
            eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
        ).toBeDefined();
        expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length).toBe(
            1
        );
        expect(
            eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
        ).toMatchObject(eventHandler);
    });

    it("should unregister an event handler", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new FirstConsoleLogWhenCustomerItsCreatedHandler();

        eventDispatcher.register("CustomerCreatedEvent", eventHandler);

        expect(
            eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
        ).toMatchObject(eventHandler);

        eventDispatcher.unregister("CustomerCreatedEvent", eventHandler);

        expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length).toBe(
            0
        );
    });

    it("should unregister all event handlers", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new FirstConsoleLogWhenCustomerItsCreatedHandler();

        eventDispatcher.register("CustomerCreatedEvent", eventHandler);

        expect(
            eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
        ).toMatchObject(eventHandler);

        eventDispatcher.unregisterAll();

        expect(
            eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
        ).toBeUndefined();
    });

    it("should notify all event handlers", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new FirstConsoleLogWhenCustomerItsCreatedHandler();
        const secondEventHandler = new SecondConsoleLogWhenCustomerItsCreatedHandler();
        const spyEventHandler = jest.spyOn(eventHandler, "handle");
        const spySecondEventHandler = jest.spyOn(secondEventHandler, "handle");

        eventDispatcher.register("CustomerCreatedEvent", eventHandler);
        eventDispatcher.register("CustomerCreatedEvent", secondEventHandler);

        expect(
            eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
        ).toMatchObject(eventHandler);
        
        const customerCreatedEvent = new CustomerCreatedEvent({
            name: "Customer Name",
            address: {
                street: "Customer Street",
                city: "Customer City",
                state: "Customer State",
                zipCode: "Customer Zip Code"
            },
            active: true,
            rewardPoints: 0
        });

        eventDispatcher.notify(customerCreatedEvent);

        expect(spyEventHandler).toHaveBeenCalled();
        expect(spySecondEventHandler).toHaveBeenCalled();

    });

    it("should notify handler after customer change address", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new NotifyThatCustomerAddressChangedHandler();
        const spyEventHandler = jest.spyOn(eventHandler, "handle");

        eventDispatcher.register("CustomerAddressChangedEvent", eventHandler);

        expect(
            eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"][0]
        ).toMatchObject(eventHandler);
        
        const customerAddressChangedEvent = new CustomerAddressChangedEvent({
            id: "1",
            name: "Customer Name",
            address: {
                street: "Customer Street",
                city: "Customer City",
                state: "Customer State",
                zipCode: "Customer Zip Code"
            },        
        })

        eventDispatcher.notify(customerAddressChangedEvent);

        expect(spyEventHandler).toHaveBeenCalled();
    });

});