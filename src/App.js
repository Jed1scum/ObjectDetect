import React, { Component } from 'react';
import logo from './logo.svg';


// eslint-disable-next-line
import MagicDropzone from "react-magic-dropzone";

//import tensorflow models
// eslint-disable-next-line
import * as tf from "@tensorflow/tfjs";
// eslint-disable-next-line
import * as cocoSsd from "@tensorflow-models/coco-ssd";
// eslint-disable-next-line
import * as mobileNet from "@tensorflow-models/mobilenet";

import './App.css';

class App extends Component {

  state = {
    modelsReady: false,
    value: "image/jpeg, image/png, .jpg, .jpeg, .png",
    previews: [],
    predictions: []
  };

  componentDidMount() {
    cocoSsd.load().then(objectModel => {
      this.setState({
        objectModel: objectModel
      });
    });

    mobileNet.load().then(classifyModel =>{
      this.setState({
        classifyModel: classifyModel
      })
    })
    this.state.modelsReady = true;
  }

  onDrop = (accepted, rejected, links) => {
    this.setState({ preview: accepted[0].preview || links[0] });
  }

  onChange = e => {
    this.setState({
      value: e.target.value
    });
  };

  cropToCanvas = (image, canvas, ctx) => {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (naturalWidth > naturalHeight) {
      ctx.drawImage(
        image,
        (naturalWidth - naturalHeight) / 2,
        0,
        naturalHeight,
        naturalHeight,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    } else {
      ctx.drawImage(
        image,
        0,
        (naturalHeight - naturalWidth) / 2,
        naturalWidth,
        naturalWidth,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    }
  };

  onImageChange = e => {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    this.cropToCanvas(e.target, c, ctx);
    this.state.objectModel.detect(c).then(predictions => {
      // Font options.
      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";

      predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];
        // Draw the bounding box.
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);
        // Draw the label background.
        ctx.fillStyle = "#00FFFF";
        const textWidth = ctx.measureText(prediction.class).width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
      });

      predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#000000";
        ctx.fillText(prediction.class, x, y);
      });
    });

    this.state.classifyModel.classify(e.target).then(predictions => {
      this.setState({ predictions: predictions });
    });
  };



  render() {
    return (
      <div className="App">
        <header className="App-header">
          
          <p>
            Image Detect App
          </p>
          
        </header>
        <div className="Dropzone-page">
            <input
                className="Dropzone-input"
                onChange={this.onChange}
                value={this.state.value}
                placeholder="Accept"
                type="text"
              />
              {this.state.modelsReady ? (
                <MagicDropzone
                className="Dropzone"
                accept="image/jpeg, image/png, .jpg, .jpeg, .png"
                multiple={false}
                onDrop={this.onDrop}>

                <div className="Dropzone-content">
                {this.state.preview ? (
                  <img
                    alt="upload preview"
                    onLoad={this.onImageChange}
                    className="Dropzone-img"
                    src={this.state.preview}
                  />
                  ) : (
                    "Drop some files on me!"
                  )}
                
                </div>
                <canvas id="canvas"/>
              </MagicDropzone>
              ) : (
                <div className="Dropzone">Loading model...</div>
              )}
              <div>
                {this.state.predictions.map(item => (
                  <div className="prediction" key={item.className}>
                    <div>{item.className}</div>
                    <div>{item.probability.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
      </div>
    );
  }
}

export default App;
