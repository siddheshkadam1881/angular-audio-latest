import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Recorder from 'recorder-js';

declare var MediaRecorder: any;
const httpOptions = {
  headers: new HttpHeaders({
    'responseType' : 'blob as json',
    'Content-Type':  'application/json',
    'Accept': 'application/json'
  })
};
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})

export class AppComponent implements OnInit {
  blobFile;
  recordAudio;
  sendObj = {
    audio: this.blobFile
  };
  audioContext =  new (AudioContext)({sampleRate: 16000});
  recorder = new Recorder(this.audioContext, {});
  
  constructor(private http: HttpClient) {}
  ngOnInit() {
   this.recordAudio = () => {
      return new Promise(resolve => {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            const mediaRecorder = new MediaRecorder(stream, {
              mimeType: 'audio/webm',
              numberOfAudioChannels: 1,
              audioBitsPerSecond : 16000,
            });
            const audioChunks = [];

            mediaRecorder.addEventListener("dataavailable", event => {
              audioChunks.push(event.data);
            });

            const start = () => {
              mediaRecorder.start();
            };

            const stop = () => {
              return new Promise(resolve => {
                mediaRecorder.addEventListener('stop', () => {
                  const audioBlob = new Blob(audioChunks, { 'type' : 'audio/wav; codecs=MS_PCM' });
                  const reader = new FileReader();
                  reader.readAsDataURL(audioBlob);
                  reader.addEventListener('load', () => {
                    const base64data =  reader.result;
                    this.sendObj.audio = base64data;
                    // this.http.post('apiUrl', this.sendObj, httpOptions).subscribe(data => console.log(data));
                  }, false);
                  const audioUrl = URL.createObjectURL(audioBlob);
                  console.log('Audiourl', audioUrl);
                  const audio = new Audio(audioUrl);
                  const play = () => {
                    audio.play();
                  };
                  resolve({ audioBlob, audioUrl, play });
                });

                mediaRecorder.stop();
              });
            };
            resolve({ start, stop });
          });
      });
    };
  }
  async startPlay() {
    this.recorder = await this.recordAudio();
    this.recorder.start();
  }

  async stopPlay() {
    const audio = await this.recorder.stop();
    audio.play();
  }

}
