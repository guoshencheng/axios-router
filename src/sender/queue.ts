import axios, { AxiosRequestConfig } from 'axios';
import { EventEmitter } from 'fbemitter';
import { AxiosSender } from '..';

const FINISH_TASK = 'FINISH_TASK';
const FINISH_TASK_ERROR = 'FINISH_TASK_ERROR';

type Task = (...args) => Promise<any>;
type TaskObj = {
  task: Task,
  args: any,
  key: string,
}

// 任务队列
class Queue extends EventEmitter {
  concurrent: number
  doing: TaskObj[]
  waiting: TaskObj[]
  isRunning: boolean;

  constructor(concurrent: number) {
    super();
    this.concurrent = concurrent;
    this.doing = new Array<TaskObj>();
    this.waiting = new Array<TaskObj>();
    this.isRunning = false;
  }

  push(task: Task, args?: any): TaskObj {
    const time = new Date().getTime();
    const key = `${time}-${this.waiting.length}`;
    const taskObj = {
      task, key, args
    }
    this.waiting.push(taskObj);
    if (this.doing.length < this.concurrent) {
      this.next();
    }
    return taskObj;
  }

  async next() {
    const taskObj = this.waiting.shift();
    if (taskObj) {
      if (!this.isRunning) {
        this.isRunning = true;
      }
      const { task, args, key } = taskObj;
      let result;
      try {
        result = await task(args);
      } catch (error) {
        this.emit(`${FINISH_TASK_ERROR}-${key}`, error);
        return;
      }
      this.emit(`${FINISH_TASK}-${key}`, result);
      this.next()
    } else {
      if (this.doing.length < 1) {
        this.isRunning = false;
      }
    }
  }
}

// Sender
export default (concurrent: number, Sender: AxiosSender) => {
  Sender = Sender || axios;
  const queue = new Queue(concurrent);
  return (config: AxiosRequestConfig) => {
    const { key } = queue.push(Sender, config);
    return new Promise((resolve, reject) => {
      const removeAll = () => {
        queue.removeAllListeners(`${FINISH_TASK}-${key}`);
        queue.removeAllListeners(`${FINISH_TASK_ERROR}-${key}`);
      }
      queue.once(`${FINISH_TASK}-${key}`, (result) => {
        removeAll();
        resolve(result);
      })
      queue.once(`${FINISH_TASK_ERROR}-${key}`, (error) => {
        removeAll();
        reject(error);
      })
    })
  }
}
