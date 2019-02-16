import React, {Component} from 'react';
import './App.css';

import MagicDropzone from 'react-magic-dropzone'; // Meng-import 'react-magic-dropzone'
import '@tensorflow/tfjs'; // Meng-import 'Tensorflow.js'
import * as cocoSsd from '@tensorflow-models/coco-ssd'; // Meng-import 'COCO-SSD'


class App extends Component {
    state = {
        preview: "",
        model: null,
    };

    // Function yang berjalan saat aplikasi akan di-render
    componentDidMount() {
        // Menyimpan model COCO-SSD ke dalam varibel model di dalam state
        cocoSsd.load().then((model) => {
            this.setState({
                model: model,
            });
        });
    }

    // Function yang berjalan saat gambar mulai di-upload
    onDrop = (accepted, rejected, links) => {
        // Mentimpan tampilan gambar pada varibel preview di dalam state
        this.setState({
            preview: accepted[0].preview || links[0]
        })
    };

    // Function untuk menduplikasi gambar ke canvas
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
                ctx.canvas.height,
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
                ctx.canvas.height,
            );
        }
    };

    // Function yang berjalan setelah gambar ter-load
    onImageLoad = (e) => {
        const img = document.querySelector('img');
        const c  = document.getElementById('canvas');
        const ctx = c.getContext('2d');

        this.cropToCanvas(e.target, c, ctx);

        // Mulai mendeteksi gambar dengan model
        this.state.model.detect(c).then((predictions) => {
            // Font untuk menampilkan nama objek
            const font = '16px sans-serif';
            ctx.font = font;
            ctx.textBaseline = 'top';

            predictions.forEach((prediction) => {
                console.log(prediction);

                const x = prediction.bbox[0];
                const y = prediction.bbox[1];
                const width = prediction.bbox[2];
                const height = prediction.bbox[3];

                // Menampilkan kotak yang menunjukkan objek dalam gambar
                ctx.strokeStyle = '#00FFFF';
                ctx.lineWidth = 4;
                ctx.strokeRect(x, y, width, height);

                // Menampilkan kotak untuk nama objek dalam gambar
                ctx.fillStyle = '#00FFFF';
                const textWidth = ctx.measureText(prediction.class).width;
                const textHeight = parseInt(font, 10);
                ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
            });

            predictions.forEach((prediction) => {
                const x = prediction.bbox[0];
                const y = prediction.bbox[1];

                // Menampilkan tulisan nama objek dalam gambar
                ctx.fillStyle = '#000000';
                ctx.fillText(prediction.class, x, y);
            });
        });
    };

    render() {
        return (
            <div className="dropzone-page">
                {/* Menampilkan area upload jika variabel model dalam state sudah terisi */}
                {this.state.model ? (
                /* Menggunakan 'react-magic-dropzone' */
                <MagicDropzone
                    className="dropzone"
                    accept="image/jpeg, image/png, .jpg, .jpeg, .png"
                    multiple={false}
                    onDrop={this.onDrop} // Menjalankan function onDrop saat gambar mulai di-upload
                >
                    {/* Menampilkan tampilan gambar jika variabel preview dalam state sudah terisi */}
                    {this.state.preview ? (
                        <img
                            src={this.state.preview}
                            onLoad={this.onImageLoad} // Menjalankan function onImage setelah gambar ter-upload
                            alt="Preview"
                            className="dropzone-img"
                        />
                    ) : (
                        "Click here to upload or drop a image"
                    )}
                    <canvas id="canvas" />
                </MagicDropzone>) : (
                    <div className="dropzone">
                        Loading model...
                    </div>
                )}
            </div>
        );
    }
}

export default App;