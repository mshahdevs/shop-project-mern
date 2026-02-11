import { Link ,useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import FormContainer from "../FormContainer";
import { Button, Form, Row,Col, ListGroup,Image, Card } from "react-bootstrap";
import { saveShippingAddress } from "../../actions/cartActions";
import CheckoutSteps from "../CheckoutSteps";
import Message from "../Message";

const PlaceOrderScreen = () =>{
    const cart = useSelector((state)=>state.cart)
    console.log(cart)
    // Calculate Prices
    cart.itemsPrice = cart.cartItems.reduce((acc,item)=> acc + item.price * item.qty,0).toFixed(2)

    cart.shippingPrice = cart.itemsPrice > 100 ? 0 : 100;
    cart.taxPrice = Number(0.15 * cart.itemsPrice).toFixed(2);

    function placeOrderHandler(){

    }
 return(
    <>
    <CheckoutSteps step1 step2 step3 />
    <Row>

    <Col md={8} >
    <ListGroup variant="flush">
        <ListGroup.Item>
            <h2>Shipping</h2>
            <p>
                <strong>Address:</strong>
                {" "}{cart.shippingAddress.address}{" "},{cart.shippingAddress.city}{" "}{cart.shippingAddress.postalCode},{cart.shippingAddress.country}
            </p>
        </ListGroup.Item>
        <ListGroup.Item>
            <h1>Payment Method</h1>
            <strong>Method:</strong>
            {" "}{cart.paymentMethod}
        </ListGroup.Item>
        <ListGroup.Item>
            <h1>Order Items</h1>
            {cart.cartItems.length === 0 ?  <Message>Your cart is empty.</Message> : (
                <ListGroup variant="flush">
                    {cart.cartItems.map((item,index)=>(
                        <ListGroup.Item key={index}>
                              <Row>
                                <Col md={1}>
                                <Image src={item.image} alt={item.name} 
                                fluid rounded />
                                </Col>
                                <Col>
                                <Link to={`/product/${item.product}`}>
                                  {item.name}
                                </Link>
                                </Col>
                                 <Col>
                                
                                  {item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}
                            
                                </Col>
                                
                              </Row>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </ListGroup.Item>
    </ListGroup>
    </Col>
    <Col md={4}>
                                  <Card>
                                    <ListGroup variant="flush">
                                         <ListGroup.Item>
                                            <h2>Order Summary</h2>
                                         </ListGroup.Item>
                                         <ListGroup.Item>
                                            <Row>
                                                <Col>Items
                                                </Col>
                                                <Col>${cart.itemsPrice}</Col>
                                            </Row>
                                            
                                         </ListGroup.Item>
                                          <ListGroup.Item>
                                            <Row>
                                                <Col>Shipping
                                                </Col>
                                                <Col>{cart.shippingPrice}</Col>
                                            </Row>
                                            
                                         </ListGroup.Item>
                                          <ListGroup.Item>
                                            <Row>
                                                <Col>Tax
                                                </Col>
                                                <Col>${cart.taxPrice}</Col>
                                            </Row>
                                            
                                         </ListGroup.Item>
                                          <ListGroup.Item>
                                            <Row>
                                                <Col>Total
                                                </Col>
                                                <Col>${cart.totalPrice}</Col>
                                            </Row>
                                            
                                         </ListGroup.Item>
                                          <ListGroup.Item>
                                            <Button type="button" className="btn-block" onClick={placeOrderHandler} disabled={cart.cartItems === 0} >Place Order</Button>
                                            
                                         </ListGroup.Item>
                                    </ListGroup>
                                  </Card>
                                </Col>
    </Row>
    </>
 )
}

export default PlaceOrderScreen;