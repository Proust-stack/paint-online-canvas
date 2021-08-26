import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import canvasState from '../store/canvasState';
import toolState from '../store/toolState';
import '../styles/canvas.css';
import Brush from '../tools/Brush';
import Rect from '../tools/Rext';
import  {Modal, Button} from "react-bootstrap";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Circle from '../tools/Circle';

const Canvas = observer(() => {
    const canvasRef = useRef()
    const usernameRef = useRef()
    const [modal, setModal] = useState(true)
    const params = useParams()

    useEffect(() => {
        canvasState.setCanvas(canvasRef.current)
        let ctx = canvasRef.current.getContext('2d')
        axios.get(`https://paint-online-canvas.herokuapp.com/image?id=${params.id}`)
        .then(response => {
            const img = new Image();
            img.src = response.data;
            img.onload = () => {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height)
        }
        })
    }, [])

    useEffect(() => {
        if (canvasState.username) {
            const socket = new WebSocket(`ws://paint-online-canvas.herokuapp.com/`)
            canvasState.setSocket(socket);
            canvasState.setSessionId(params.id);
            toolState.setTool(new Brush(canvasRef.current, socket, params.id))
            socket.onopen = () => {
            socket.send(JSON.stringify({
                id: params.id,
                username: canvasState.username,
                method: "connection"
            }))
        }
        socket.onmessage = (event) => {
            let msg = JSON.parse(event.data)
            switch (msg.method) {
                case "connection":
                    const newUserElement = document.createElement('div');
                    newUserElement.textContent = msg.username;
                    const listOfUsers = document.getElementsByClassName('right-side__title')
                    listOfUsers[0].appendChild(newUserElement)
                    break;
                case "draw":
                        drawHandler(msg)
                    break;
            
                default:
                    break;
            }
            }         
    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log('Соединение закрыто чисто');
        } else {
            console.log('Обрыв соединения'); // например, "убит" процесс сервера
        }
        console.log('Код: ' + event.code + ' причина: ' + event.reason);
    };
    
    socket.onerror = function(error) {
        console.log("Ошибка " + error.message);
    };
    
        }
    }, [canvasState.username])


    const drawHandler = (msg) => {
        const figure = msg.figure;
        const ctx = canvasRef.current.getContext('2d');
        switch (figure.type) {
            case 'brush':
                Brush.staticDraw(ctx, figure.x, figure.y, figure.color, figure.lineWidth)
                break;
            case 'rect':
                Rect.staticDraw(ctx, figure.x, figure.y, figure.width, figure.height, figure.color, figure.lineWidth)
                break;
            case 'circle':
                Circle.staticDraw(ctx, figure.x, figure.y, figure.r, figure.color)
                break;
            case 'line':
                Circle.staticDraw(ctx, figure.x, figure.y, figure.toX, figure.toY,  figure.color)
                break;
            case 'finish':
                ctx.beginPath()
                break;
        
            default:
                break;
        }
    }
    const mouseDownHandler = () => {
        canvasState.pushToUndo(canvasRef.current.toDataURL())
        if (canvasRef.current.toDataURL()) {
            axios.post(`https://paint-online-canvas.herokuapp.com/image?id=${params.id}`, {img: canvasRef.current.toDataURL()})
        .catch(error => console.log('error on saving', error))
        }
    }

    const connectHandler = () => {
            canvasState.setUsername(usernameRef.current.value)
            setModal(false)
        };


    return (
        <div className="canvas">
            <Modal 
            show={modal} 
            onHide={() => {}}
            variant="primary"
            centered
            animation
            >
                <Modal.Header>
                <Modal.Title>Привет! Как тебя зовут?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input type="text" ref={usernameRef}/>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={() => connectHandler()}>
                    Начать
                </Button>
                </Modal.Footer>
            </Modal>
            <div className="main">
                <div className="left-side"></div>
                <canvas 
                ref={canvasRef} 
                width={1000} 
                height={700}
                onMouseDown={() => mouseDownHandler()} 
                >
                </canvas>
                <div className="right-side">
                    <div className="right-side__title">Участники:</div>
                </div>
            </div>
            <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
        </div>
    );
});

export default Canvas;