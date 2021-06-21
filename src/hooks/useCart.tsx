import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';
//permite colocar no app html
interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number; //valor
}
//compartilhar o produto e as funçoes com todos componentes
interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}
//compartilhar o produto e as funçoes com todos componentes, inicia como vazio
const CartContext = createContext<CartContextData>({} as CartContextData);
//permite colocar no app html
export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [stock, setStock] = useState<Stock[]>([]);
  const [product, setProduct] = useState<Product[]>([]);  

  const [cart, setCart] = useState<Product[]>(() => {     
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  useEffect(() => {
    api.get('stock')
        .then(response => {
          setStock(response.data)
          //console.log(response.data)
         
        })
  }, []);
    
  useEffect(() => {
    api.get('products')
        .then(response => {          
          const productSemAmount = response.data;
          const productWithAmount = productSemAmount.map((product: Omit<Product, 'amount'>) =>{            
            return {
              ...product,
              amount: 0
            }
          });          
          setProduct(productWithAmount)           
        })
  }, []);

  

  const addProduct = async (productId: number) => {
    try { 
      
      const productInStock = stock.find(stock=>stock.id === productId);
      const productInCart = cart.find(cart=>cart.id === productId);

      if(productInStock && productInCart){           
        updateProductAmount({ productId , amount: productInCart.amount+1 })

      }else if(productInStock){
        const productFind = product.find(product=> product.id === productId)
        if(productFind){
          productFind.amount =1
          setCart([...cart, productFind])
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, productFind]))
        }
       
      }else{
        toast.error('Quantidade solicitada fora de estoque');
      }


    }catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const cartNew = cart.filter((product)=>{
        return product.id !== productId
      })
      setCart(cartNew)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartNew))     
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount<=0){
        return;
      }
      
      const productInStock = stock.find(stock=>stock.id === productId)
        

      if(productInStock && productInStock.amount >= amount){
        const newCart = cart.map(cart=>{
          if(cart.id === productId){
            cart.amount = amount;            
          }
          return cart;
        })
        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      }else{
        toast.error('Quantidade solicitada fora de estoque');        
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
