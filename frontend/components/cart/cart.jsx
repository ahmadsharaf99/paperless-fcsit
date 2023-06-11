import React from 'react';
import CartItem from './cart-item';

const Cart = (props) => {
  console.log('props', props.cartItems);
  return (
    <div className="container">
      <div
        className="table-responsive"
        style={{ maxHeight: '500px', overflowY: 'auto' }}
      >
        <table className="table w-100 border">
          <thead>
            <tr>
              <th>SN</th>
              <th>Item</th>
              <th>Price</th>
              {/* <th>Discount</th> */}
              <th>Qty</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {props.cartItems.map((item, index) => (
              <CartItem
                key={index}
                sn={index + 1}
                item={item}
                changed={(event) =>
                  props.onQuantityChanged(event.target.value, index)
                }
                clicked={() => props.onDelete(index)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cart;
