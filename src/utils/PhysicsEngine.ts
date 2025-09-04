import Matter from 'matter-js';

/**
 * 物理引擎配置接口
 */
export interface PhysicsConfig {
  gravity: number;
  friction: number;
  restitution: number;
  hexagonRotationSpeed: number;
  ballRadius: number;
  hexagonSize: number;
}

/**
 * 物理状态接口
 */
export interface PhysicsState {
  ballPosition: { x: number; y: number };
  ballVelocity: { x: number; y: number };
  hexagonAngle: number;
  ballSpeed: number;
  kineticEnergy: number;
}

/**
 * 六边形物理模拟引擎类
 * 封装Matter.js，处理六边形容器和小球的物理模拟
 */
export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private ball!: Matter.Body;
  private hexagonWalls: Matter.Body[] = [];
  private hexagonCenter: { x: number; y: number };
  private config: PhysicsConfig;
  private hexagonAngle: number = 0;

  constructor(canvasWidth: number, canvasHeight: number, config: PhysicsConfig) {
    // 初始化Matter.js引擎
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.config = config;
    this.hexagonCenter = { x: canvasWidth / 2, y: canvasHeight / 2 };

    // 设置重力
    this.engine.world.gravity.y = config.gravity;
    this.engine.world.gravity.x = 0;

    // 创建六边形容器
    this.createHexagon();

    // 创建小球
    this.createBall();
  }

  /**
   * 创建六边形容器的墙壁
   */
  private createHexagon(): void {
    const { hexagonSize } = this.config;
    const { x: centerX, y: centerY } = this.hexagonCenter;
    
    // 清除现有墙壁
    this.hexagonWalls.forEach(wall => {
      Matter.World.remove(this.world, wall);
    });
    this.hexagonWalls = [];

    // 创建六边形的六条边
    for (let i = 0; i < 6; i++) {
      const angle1 = (i * Math.PI) / 3;
      const angle2 = ((i + 1) * Math.PI) / 3;
      
      const x1 = centerX + hexagonSize * Math.cos(angle1);
      const y1 = centerY + hexagonSize * Math.sin(angle1);
      const x2 = centerX + hexagonSize * Math.cos(angle2);
      const y2 = centerY + hexagonSize * Math.sin(angle2);
      
      const wallLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const wallAngle = Math.atan2(y2 - y1, x2 - x1);
      
      const wall = Matter.Bodies.rectangle(
        (x1 + x2) / 2,
        (y1 + y2) / 2,
        wallLength,
        10,
        {
          isStatic: true,
          angle: wallAngle,
          restitution: this.config.restitution,
          friction: this.config.friction,
          render: {
            fillStyle: '#2c3e50'
          }
        }
      );
      
      this.hexagonWalls.push(wall);
      Matter.World.add(this.world, wall);
    }
  }

  /**
   * 创建小球
   */
  private createBall(): void {
    const { ballRadius } = this.config;
    const { x: centerX, y: centerY } = this.hexagonCenter;
    
    // 如果球已存在，先移除
    if (this.ball) {
      Matter.World.remove(this.world, this.ball);
    }
    
    this.ball = Matter.Bodies.circle(centerX, centerY - 50, ballRadius, {
      restitution: this.config.restitution,
      friction: this.config.friction,
      frictionAir: 0.01, // 空气阻力
      render: {
        fillStyle: '#e74c3c'
      }
    });
    
    Matter.World.add(this.world, this.ball);
  }

  /**
   * 旋转六边形容器
   */
  private rotateHexagon(): void {
    const { hexagonRotationSpeed } = this.config;
    this.hexagonAngle += hexagonRotationSpeed;
    
    const { x: centerX, y: centerY } = this.hexagonCenter;
    
    this.hexagonWalls.forEach((wall, index) => {
      const baseAngle = (index * Math.PI) / 3;
      const angle1 = baseAngle + this.hexagonAngle;
      const angle2 = baseAngle + Math.PI / 3 + this.hexagonAngle;
      
      const x1 = centerX + this.config.hexagonSize * Math.cos(angle1);
      const y1 = centerY + this.config.hexagonSize * Math.sin(angle1);
      const x2 = centerX + this.config.hexagonSize * Math.cos(angle2);
      const y2 = centerY + this.config.hexagonSize * Math.sin(angle2);
      
      const wallAngle = Math.atan2(y2 - y1, x2 - x1);
      
      Matter.Body.setPosition(wall, { x: (x1 + x2) / 2, y: (y1 + y2) / 2 });
      Matter.Body.setAngle(wall, wallAngle);
    });
  }

  /**
   * 更新物理引擎
   */
  public update(): void {
    // 旋转六边形
    this.rotateHexagon();
    
    // 更新物理引擎
    Matter.Engine.update(this.engine, 1000 / 60); // 60 FPS
  }

  /**
   * 获取当前物理状态
   */
  public getPhysicsState(): PhysicsState {
    const ballVelocity = this.ball.velocity;
    const ballSpeed = Math.sqrt(ballVelocity.x ** 2 + ballVelocity.y ** 2);
    const kineticEnergy = 0.5 * this.ball.mass * ballSpeed ** 2;
    
    return {
      ballPosition: { x: this.ball.position.x, y: this.ball.position.y },
      ballVelocity: { x: ballVelocity.x, y: ballVelocity.y },
      hexagonAngle: this.hexagonAngle,
      ballSpeed,
      kineticEnergy
    };
  }

  /**
   * 更新物理配置
   */
  public updateConfig(newConfig: Partial<PhysicsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 更新重力
    if (newConfig.gravity !== undefined) {
      this.engine.world.gravity.y = newConfig.gravity;
    }
    
    // 更新小球属性
    if (newConfig.friction !== undefined || newConfig.restitution !== undefined) {
      Matter.Body.set(this.ball, {
        friction: this.config.friction,
        restitution: this.config.restitution
      });
    }
    
    // 更新墙壁属性
    if (newConfig.friction !== undefined || newConfig.restitution !== undefined) {
      this.hexagonWalls.forEach(wall => {
        Matter.Body.set(wall, {
          friction: this.config.friction,
          restitution: this.config.restitution
        });
      });
    }
    
    // 重新创建六边形（如果尺寸改变）
    if (newConfig.hexagonSize !== undefined) {
      this.createHexagon();
    }
    
    // 重新创建小球（如果半径改变）
    if (newConfig.ballRadius !== undefined) {
      this.createBall();
    }
  }

  /**
   * 重置游戏状态
   */
  public reset(): void {
    // 重新创建小球在中心位置
    this.createBall();
    this.hexagonAngle = 0;
  }

  /**
   * 获取所有物理体（用于渲染）
   */
  public getAllBodies(): Matter.Body[] {
    return [this.ball, ...this.hexagonWalls];
  }

  /**
   * 销毁物理引擎
   */
  public destroy(): void {
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
  }
}
