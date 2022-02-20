import React, {useState} from 'react';
import { useQuery } from 'react-query'
// Component
import Item from './Item/Item'
import Cart from './Cart/Cart';
import { Drawer, LinearProgress, Grid, Badge } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
// styles
import { StyledButton, Wrapper } from './App.styles'
// Types
export type CartItemType = {
  id: number;
  category: string;
  description: string;
  image: string;
  price: number;
  title: string;
  amount: number;
}

const getProducts = async (): Promise<CartItemType[]> => 
  await (await fetch('https://fakestoreapi.com/products')).json()


function App() {

  const [cartOpen, setCartOpen] = useState(false)

  const [cartItems, setCartItems] = useState([] as CartItemType[])

  const { data, isLoading, error } = useQuery<CartItemType[]>('products', getProducts)

  const getTotalItems = (items: CartItemType[]) => 
    items.reduce((acc:number, item) => acc += item.amount, 0);

  const handleAddToCart = (clickedItem: CartItemType) => 
    setCartItems(prev => {
      // 1. is the item already added in the cart
      const itemsInCart = prev.find(item => item.id === clickedItem.id)

      if(itemsInCart){
        return prev.map(item => 
          item.id === clickedItem.id ? {...item, amount: item.amount + 1} : item
        )
      }

      // add item first time 
      return [...prev, {...clickedItem, amount: 1}]
    })

  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev =>
      prev.reduce((acc, item) => {

        if (item.id === id) {
          if (item.amount === 1) return acc;
          return [...acc, { ...item, amount: item.amount - 1 }];
        } else {
          return [...acc, item];
        }

      }, [] as CartItemType[])
    );
  }
  


  if(isLoading) return <LinearProgress />
  if(error) return <div>Something went wrong</div>

  return (
    <Wrapper>
      <Drawer
      anchor='right'
      open={cartOpen}
      onClose={() => setCartOpen(false)}
    >
      <Cart 
        cartItems={cartItems}
        removeFromCart={handleRemoveFromCart}
        addToCart={handleAddToCart}
      />
    </Drawer>

    <StyledButton onClick={() => setCartOpen(true)}>
      <Badge badgeContent={getTotalItems(cartItems)} color='error'>
        <AddShoppingCartIcon />
      </Badge>
    </StyledButton>

      <Grid container spacing={3}>
        {data?.map(item => (
          <Grid item key={item.id} xs={12} sm={4}>
            <Item item={item} handleAddToCart={handleAddToCart}/>
          </Grid>
        ))}
      </Grid>
    </Wrapper>
  );
}

export default App;
