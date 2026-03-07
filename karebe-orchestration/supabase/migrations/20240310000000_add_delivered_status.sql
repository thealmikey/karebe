-- =============================================================================
-- Add DELIVERED status to order_status enum
-- =============================================================================

-- First, check if the enum type exists and what values it has
-- If using VARCHAR with CHECK constraint, alter it
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN (
    'CART_DRAFT',
    'ORDER_SUBMITTED', 
    'CONFIRMED_BY_MANAGER',
    'DELIVERY_REQUEST_STARTED',
    'RIDER_CONFIRMED_DIGITAL',
    'RIDER_CONFIRMED_MANUAL',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
));

-- Also update order_state_transitions table if it has similar constraints
ALTER TABLE order_state_transitions DROP CONSTRAINT IF EXISTS order_state_transitions_previous_status_check;
ALTER TABLE order_state_transitions DROP CONSTRAINT IF EXISTS order_state_transitions_new_status_check;

ALTER TABLE order_state_transitions 
ADD CONSTRAINT order_state_transitions_previous_status_check 
CHECK (previous_status IN (
    'CART_DRAFT',
    'ORDER_SUBMITTED', 
    'CONFIRMED_BY_MANAGER',
    'DELIVERY_REQUEST_STARTED',
    'RIDER_CONFIRMED_DIGITAL',
    'RIDER_CONFIRMED_MANUAL',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
));

ALTER TABLE order_state_transitions 
ADD CONSTRAINT order_state_transitions_new_status_check 
CHECK (new_status IN (
    'CART_DRAFT',
    'ORDER_SUBMITTED', 
    'CONFIRMED_BY_MANAGER',
    'DELIVERY_REQUEST_STARTED',
    'RIDER_CONFIRMED_DIGITAL',
    'RIDER_CONFIRMED_MANUAL',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
));
