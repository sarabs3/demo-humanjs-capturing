import { Component, createRef } from "react";
import type { Human, Config } from '@vladmandic/human/dist/human.esm';
import { log, status } from './logging';
import validYawPitchData from './data';

function roundNearest5(num: number): number {
  return Math.round(num / 5) * 5;
}
const config: Partial<Config> = {
  debug: false,
  modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
  face: { enabled: true },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
}
type Pitch = {
  pitch: number;
  yaw: number
};
interface Props { inputId: string, outputId: string };
interface State { ready: boolean, frame: number };

class RunHuman extends Component<Props, State> {
  HumanImport: any;
  human: Human | undefined = undefined;
  video: HTMLVideoElement | undefined = undefined;
  canvas: HTMLCanvasElement | undefined = undefined;
  timestamp: number = 0;
  fps: number = 0;
  
  constructor(props: Props) { // human is loaded as dynamic import in component constructor and then sets ready state
    super(props)
    if (typeof document === 'undefined') return;
    this.video = document.getElementById(this.props.inputId) as (HTMLVideoElement | undefined) || document.createElement('video');
    this.canvas = document.getElementById(this.props.outputId) as (HTMLCanvasElement | undefined) || document.createElement('canvas');
    import('@vladmandic/human/dist/human.esm').then((H) => {
      this.human = new H.default(config) as Human;
      log('human version:', this.human.version, '| tfjs version:', this.human.tf.version['tfjs-core']);
      log('platform:', this.human.env.platform, '| agent:', this.human.env.agent);
      status('loading models...');
      this.human.load().then(() => { // preload all models
        log('backend:', this.human!.tf.getBackend(), '| available:', this.human!.env.backends);
        log('loaded models:' + Object.values(this.human!.models).filter((model) => model !== null).length);
        status('initializing...');
        this.human!.warmup().then(() => { // warmup function to initialize backend for future faster detection
          this.setState({ ready: true });

          this.anglesToCapture.current = validYawPitchData;
          this.counter.current = 0;
          status('ready...');
        });
      });
    });
  }


  anglesToCapture = createRef();
  counter = createRef();
  state = { counter: 0, ready: false }
  messages = [
    "Move your head to top left! ",
    "Move your head to top right! ",
    "Move your head to bottom right! ",
    "Move your head to bottom left! ",
    "Scan complete. "
  ];

  capturedAngles: Pitch[] = [];

  captureAngles = (pitch: number, yaw: number) => {
    this.capturedAngles.push({ pitch, yaw });
    console.log('top =>', pitch, yaw);

    switch (this.counter.current) {
      case 0 : {
        const { highestPitch, highestYaw } = this.anglesToCapture.current.topLeft;
        if (pitch < (highestPitch-10) &&  yaw < (highestYaw-10)) {
          console.log('counter 0 =>', pitch, highestPitch,  yaw, highestYaw, this.capturedAngles);
          this.counter.current += 1;
          this.video?.pause();
          
          this.captureAnglesWithFrame();
        }
        break;
      }
      case 1 : {
        const { highestPitch, highestYaw } = this.anglesToCapture.current.topRight;
        if (pitch <= highestPitch &&  yaw >= highestYaw) {
          console.log('counter 1 =>', pitch, highestPitch,  yaw, highestYaw);
          this.counter.current += 1;
          setTimeout(() => this.video?.pause(), 1000);
          
          this.captureTopRightAngles();
        }
        break;
      }
      case 2 : {
        const { highestPitch, highestYaw } = this.anglesToCapture.current.bottomRight;
        if (pitch >= highestPitch &&  yaw >= highestYaw) {
          console.log('counter 2 =>', this.state.counter);
          this.counter.current += 1;
          setTimeout(() => this.video?.pause(), 1000);
          
          this.captureBottomRightAngles();
        }
        break;
      }
      case 3 : {
        const { highestPitch, highestYaw } = this.anglesToCapture.current.bottomleft;
        if (pitch < highestPitch &&  yaw > highestYaw) {
          console.log('counter 3 =>', this.state.counter);
          this.counter.current += 1;
          setTimeout(() => this.video?.pause(), 1000);
          
          this.captureBottomLeftAngles();
        }
        break;
      }
      default : {
        break;
      }
    }
  };

  captureAnglesWithFrame = () => {
    console.log('length => ', this.anglesToCapture.current.topLeft.values.length);
    this.anglesToCapture.current.topLeft.values.forEach(({ pitch_bin, yaw_bin }) => {
      const index = this.capturedAngles.findIndex(angle => angle.pitch ===  parseInt(pitch_bin) && angle.yaw === parseInt(yaw_bin));
      if (index) {
      console.log('matched');
      this.anglesToCapture.current.topLeft.values.splice(index, 1);
    }
    })
    console.log('length => ', this.anglesToCapture.current.topLeft.values.length);
  }

  captureTopRightAngles = () => {
    console.log('length => ', this.anglesToCapture.current.topRight.values.length);
    this.anglesToCapture.current.topRight.values.forEach(({ pitch_bin, yaw_bin }) => {
      const index = this.capturedAngles.findIndex(angle => angle.pitch ===  parseInt(pitch_bin) && angle.yaw === parseInt(yaw_bin));
      if (index) {
      console.log('matched');
      this.anglesToCapture.current.topRight.values.splice(index, 1);
    }
    })
    console.log('length => ', this.anglesToCapture.current.topRight.values.length);
  }

  captureBottomRightAngles = () => {
    console.log('length => ', this.anglesToCapture.current.bottomRight.values.length);
    this.anglesToCapture.current.bottomRight.values.forEach(({ pitch_bin, yaw_bin }) => {
      const index = this.capturedAngles.findIndex(angle => angle.pitch ===  parseInt(pitch_bin) && angle.yaw === parseInt(yaw_bin));
      if (index) {
      console.log('matched');
      this.anglesToCapture.current.bottomRight.values.splice(index, 1);
    }
    })
    console.log('length => ', this.anglesToCapture.current.bottomRight.values.length);
  }

  captureBottomLeftAngles = () => {
    console.log('length => ', this.anglesToCapture.current.bottomleft.values.length);
    this.anglesToCapture.current.bottomleft.values.forEach(({ pitch_bin, yaw_bin }) => {
      const index = this.capturedAngles.findIndex(angle => angle.pitch ===  parseInt(pitch_bin) && angle.yaw === parseInt(yaw_bin));
      if (index) {
      console.log('matched');
      this.anglesToCapture.current.bottomleft.values.splice(index, 1);
    }
    })
    console.log('length => ', this.anglesToCapture.current.bottomleft.values.length);
  }

  getMessage = () => {
    if (!this.anglesToCapture.current) return null;
    const { topLeft, topRight, bottomleft, bottomRight } = this.anglesToCapture.current;
    const total = topLeft.values.length + topRight.values.length + bottomleft.values.length + bottomRight.values.length;
    return total;
  };

  override async componentDidMount() { // add event handlers for resize and click
    if (this.video) this.video.onresize = () => {
      this.canvas!.width = this.video!.videoWidth;
      this.canvas!.height = this.video!.videoHeight; 
      this.video?.pause();
    }
    // if (this.canvas) this.canvas.onclick = () => {
    //   this.video?.paused ? this.video?.play() : this.video?.pause();
    // }
  }

  override render(this: RunHuman) {
    if (this && this.state && this.state.ready) this.detect(); // start detection loop once component is created and human state is ready trigger detection and draw loops
    if (!this || !this.video || !this.canvas || !this.human || !this.human.result) return null;
    if (!this.video.paused) {
      const interpolated = this.human.next(this.human.result); // smoothen result using last-known results
      if (interpolated.face[0]){
      const { yaw, pitch } = interpolated.face[0]?.rotation?.angle;
      if ( yaw && pitch) {
        const rad2deg = (theta: number) => Math.round((theta * 180) / Math.PI);
        console.log("interpolated", 'yaw', roundNearest5(rad2deg(yaw)), 'pitch', roundNearest5(rad2deg(pitch)));
        this.captureAngles(roundNearest5(rad2deg(pitch)), roundNearest5(rad2deg(yaw)));
      }
    }
      this.human.draw.canvas(this.video, this.canvas); // draw canvas to screen
      // this.human.draw.all(this.canvas, interpolated); // draw labels, boxes, lines, etc.
    }
    status(this.video.paused ? 'paused' : `fps: ${this.fps.toFixed(1).padStart(5, ' ')}`); // write status
    if (this.video.paused) {
      return (
        <>
        <p className="text">{this.messages[this.counter.current]} 
        <br />
        <span>Frames to be captured {this.getMessage()}</span>
        <button onClick={() => this.video?.play()}>Start Recording!</button>
        </p>
        
      </>
    );
      }
    return null;
  }

  async detect(this: RunHuman) { // main detection loop
    if (!this || !this.human || !this.video || !this.canvas) return;
    await this.human.detect(this.video); // actual detection; were not capturing output in a local variable as it can also be reached via this.human.result
    const now = this.human.now();
    this.fps = 1000 / (now - this.timestamp);
    this.timestamp = now;
    this.setState({ ready: true, frame: this.state.frame + 1 });
  } 
}

export default RunHuman;
