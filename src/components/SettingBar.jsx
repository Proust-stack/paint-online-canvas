import React from 'react';
import toolState from '../store/toolState';
import '../styles/toolbar.scss'

const SettingBar = () => {
    return (
        <div className="setting-bar">
            <label 
            htmlFor="line-width"
            style={{margin: '0 10px'}}
            >
                толщина линии
            </label>
            <input 
            onChange={(e) => toolState.setLineWidth(e.target.value)}
            id="line-width" 
            type="number" 
            min={1} max={50} 
            defaultValue={3}
            style={{margin: '0 10px'}}
            />
            <label 
            htmlFor="stroke-color"
            style={{margin: '0 10px'}}
            >
                Цвет обводки
            </label>
            <input 
            id="stroke-color" 
            type="color" 
            onChange={e => toolState.setStrokeColor(e.target.value)}/>
        </div>
    );
};

export default SettingBar;