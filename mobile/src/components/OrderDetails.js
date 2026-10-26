import { View } from "react-native";
import { formatDate } from "@shared/lib/format";
import { useColors } from "@/context/StoreContext";
import { OrderItems, OrderTimeline, PaymentInfo, StatusBadge } from "./shop";
import { Heading, Panel, Row, T } from "./ui";

// Order status, items, delivery address and payment (confirmation and tracking screens).
export default function OrderDetails({ order, showCustomer = true }) {
  const colors = useColors();
  const { customer } = order;
  return (
    <View style={{ gap: 14 }}>
      <Panel>
        <Heading size={17} style={{ marginBottom: 16 }}>
          Order Status
        </Heading>
        <OrderTimeline order={order} />
      </Panel>
      <Panel>
        <Row style={{ justifyContent: "space-between", marginBottom: 4 }}>
          <Heading size={17}>Order Details</Heading>
          <StatusBadge status={order.status} />
        </Row>
        <T size={13.5} color={colors.grey[500]}>
          Placed on {formatDate(order.createdAt, true)}
        </T>
        <OrderItems order={order} />
      </Panel>
      <Panel style={{ gap: 2 }}>
        {showCustomer && (
          <>
            <Heading size={17} style={{ marginBottom: 6 }}>
              Delivery To
            </Heading>
            <T weight="bold">{customer.name}</T>
            <T color={colors.grey[500]}>{customer.address}</T>
            <T color={colors.grey[500]}>{customer.city}</T>
            <T color={colors.grey[500]} style={{ marginTop: 6 }}>
              📞 {customer.phone}
            </T>
            <T color={colors.grey[500]}>✉️ {customer.email}</T>
          </>
        )}
        <Heading size={17} style={{ marginTop: showCustomer ? 14 : 0, marginBottom: 4 }}>
          Payment
        </Heading>
        <PaymentInfo order={order} />
      </Panel>
    </View>
  );
}
