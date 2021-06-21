import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';
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
  
   

  const [cart, setCart] = useState<Product[]>(() => {     
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });


  

  const addProduct = async (productId: number) => {
    try { 
      const productInStock = await api.get(`stock/${productId}`)
          .then(response => {
            return response.data
          })
          
      const productForId= await api.get(`products/${productId}`)
          .then(response => { 
            return response.data
          })  
      
      const productInCart = cart.find(cart=>cart.id === productId);

      if(productInStock && !productInCart){
        const newProduct: Product = {
          ...productForId,
          amount: 1
        }
        setCart([...cart, newProduct])        
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, newProduct]))
        return;
      }

      if(productInStock && productInCart){
        const newAmount =  productInCart.amount+1                 
        updateProductAmount({ productId , amount: newAmount})             
      }
      
      if(!productInStock && !productInCart){
        toast.error('Quantidade solicitada fora de estoque');
      }
    }catch{
      toast.error('Erro na adição do produto');
    }

  };

  const removeProduct = (productId: number) => {
    try {
      const productInCart = cart.find(cart=>cart.id === productId);
      const productForId= api.get(`products/${productId}`)
          .then(response => { 
            return response.data
          })

      if(productInCart && productForId){
        const cartNew = cart.filter((product)=>{
          return product.id !== productId
        })
        setCart(cartNew)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartNew)) 
      }else{
        toast.error('Erro na remoção do produto')
      }         
    } catch {
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount<1){
        toast.error('Erro na alteração de quantidade do produto')
        return;
      }      
      
      const productInStock = await api.get(`stock/${productId}`)
      .then(response => {
        return response.data
      })
      
      if(productInStock){        
        if(productInStock.amount >= amount){
          const newCart = cart.map(cartItem => cartItem.id === productId ? {
            ...cartItem, amount: amount
          }:cartItem);                     
          setCart(newCart);    
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))                         
        }else{
          toast.error('Quantidade solicitada fora de estoque')                       
        }
      }else{        
        toast.error('Erro na alteração de quantidade do produto')
         
      }      
    } catch {
      toast.error('Erro na alteração de quantidade do produto')     
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
