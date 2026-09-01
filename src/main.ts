import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('GameScene');
  }

  preload() {
    // アセットは使わず、色で長方形テクスチャを生成
    this.make.graphics({ x: 0, y: 0, fillStyle: { color: 0x55ff55 } })
      .fillRect(0, 0, 32, 48)
      .generateTexture('player', 32, 48)
      .destroy();

    this.make.graphics({ x: 0, y: 0, fillStyle: { color: 0x888888 } })
      .fillRect(0, 0, 400, 32)
      .generateTexture('ground', 400, 32)
      .destroy();

    this.make.graphics({ x: 0, y: 0, fillStyle: { color: 0x6666cc } })
      .fillRect(0, 0, 80, 32)
      .generateTexture('platform', 80, 32)
      .destroy();
  }

  create() {
    // 背景
    this.add.rectangle(400, 300, 800, 600, 0x2233aa);

    // 地面
    this.platforms = this.physics.add.staticGroup();
    this.platforms.add(this.add.rectangle(400, 584, 800, 32, 0x888888));
    this.platforms.add(this.add.rectangle(600, 450, 80, 32, 0x6666cc));
    this.platforms.add(this.add.rectangle(50, 350, 80, 32, 0x6666cc));

    // プレイヤー
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 衝突判定
    this.physics.add.collider(this.player, this.platforms);

    // キーボード入力
    this.cursors = this.input.keyboard!.createCursorKeys();

    // テキスト
    this.add.text(10, 10, '矢印キーで移動', { fontSize: '16px', color: '#ffffff' });
  }

  update() {
    // 左右移動
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // ジャンプ（接地中のみ）
    if (this.cursors.up.isDown && this.player.body!.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: false,
    },
  },
  scene: [GameScene],
};

new Phaser.Game(config);