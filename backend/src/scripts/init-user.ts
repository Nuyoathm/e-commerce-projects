import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole } from '../auth/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userModel = app.get(getModelToken(User.name));

  try {
    // 检查是否已存在用户
    const existingUser = await userModel.findOne({ username: 'admin' });
    if (existingUser) {
      console.log('用户 admin 已存在，跳过创建');
    } else {
      // 创建默认管理员用户
      const passwordHash = await bcrypt.hash('admin123', 10);
      const adminUser = new userModel({
        username: 'admin',
        passwordHash,
        role: UserRole.ADMIN,
        email: 'admin@example.com',
      });
      await adminUser.save();
      console.log('✅ 默认管理员用户创建成功:');
      console.log('   用户名: admin');
      console.log('   密码: admin123');
      console.log('   角色: admin');
    }

    // 检查是否已存在超级管理员
    const existingSuperAdmin = await userModel.findOne({ username: 'superadmin' });
    if (existingSuperAdmin) {
      console.log('用户 superadmin 已存在，跳过创建');
    } else {
      // 创建超级管理员用户
      const superAdminPasswordHash = await bcrypt.hash('superadmin123', 10);
      const superAdminUser = new userModel({
        username: 'superadmin',
        passwordHash: superAdminPasswordHash,
        role: UserRole.SUPER_ADMIN,
        email: 'superadmin@example.com',
      });
      await superAdminUser.save();
      console.log('✅ 默认超级管理员用户创建成功:');
      console.log('   用户名: superadmin');
      console.log('   密码: superadmin123');
      console.log('   角色: super_admin');
    }
  } catch (error) {
    console.error('❌ 初始化用户失败:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
