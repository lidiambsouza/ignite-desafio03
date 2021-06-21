import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {  

  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(product => ({
    product: product,
    priceFormatted: formatPrice(product.price),
    subTotal: product.amount ? formatPrice(product.price * product.amount) : 0
  }))

  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        if (product.amount) {
          sumTotal += (product.price * product.amount)

        }
        return sumTotal
      }, 0)
    )

  async function handleProductIncrement(product: Product) {    
    await updateProductAmount({ productId: product.id, amount: product.amount+1})
  }

  async function handleProductDecrement(product: Product) {    
    await updateProductAmount({ productId: product.id, amount: product.amount-1})
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId)
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map(cart => (
            <tr data-testid="product" key={cart.product.id}>
              <td>
                <img src={cart.product.image} alt={cart.product.title} />
              </td>
              <td>
                <strong>{cart.product.title}</strong>
                <span>{cart.priceFormatted}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                    disabled={cart.product.amount <= 1}
                    onClick={() => handleProductDecrement(cart.product)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={cart.product.amount}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                    onClick={() => handleProductIncrement(cart.product)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{cart.subTotal}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleRemoveProduct(cart.product.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}

        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
