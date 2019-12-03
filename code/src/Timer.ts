class Timer {
  currentStartTime: number;
  previousElapsedTime: number;
  currentElapsedTime: number;
  timeLabel: Phaser.GameObjects.Text;

  constructor() {
    this.currentStartTime = 0;
    this.previousElapsedTime = 0;
    this.currentElapsedTime = 0;
  }

  setCurrentStartTime(time: number) {
    this.currentStartTime = time;
  }

  setCurrentElapsedTime(time: number) {
    this.currentElapsedTime = time;
  }

  setPreviousElapsedTime(time: number) {
    this.previousElapsedTime += (time - this.currentStartTime) / 1000;
  }

  getTotalElapsedTime() {
    return this.previousElapsedTime + this.currentElapsedTime;
  }
}

export default Timer;
