import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    const { parentId } = createCategoryDto;
    let path = ',';

    if (parentId) {
      const parent = await this.categoryModel.findById(parentId);
      if (parent) {
        path = `${parent.path}${parent._id},`;
      }
    }

    const createdCategory = new this.categoryModel({
      ...createCategoryDto,
      path,
    });
    return createdCategory.save();
  }

  async findTree() {
    const categories = await this.categoryModel
      .find()
      .sort({ sort: 1, createdAt: 1 })
      .lean()
      .exec();

    const map = new Map();
    const tree = [];

    // 第一遍遍历：建立 ID 映射，并过滤掉空 children（保持 lean 对象的纯净）
    categories.forEach((cat) => {
      map.set(cat._id.toString(), { ...cat, children: [] });
    });

    // 第二遍遍历：构建树形结构
    categories.forEach((cat) => {
      const node = map.get(cat._id.toString());
      if (cat.parentId) {
        const parentId = cat.parentId.toString();
        const parent = map.get(parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          tree.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    // 递归清理空的 children 数组，保持输出整洁
    const cleanEmptyChildren = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length === 0) {
          delete node.children;
        } else if (node.children) {
          cleanEmptyChildren(node.children);
        }
      });
    };
    cleanEmptyChildren(tree);

    return tree;
  }

  async findAll() {
    return this.categoryModel.find().sort({ sort: 1 }).exec();
  }

  async findOne(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
    // If parentId is changing, path needs update (skipped for simplicity in this basic version, but good to note)
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return updatedCategory;
  }

  async remove(id: string) {
    // Check if has children
    const child = await this.categoryModel.findOne({ parentId: id }).exec();
    if (child) {
      throw new Error('Cannot delete category with children');
    }
    return this.categoryModel.findByIdAndDelete(id).exec();
  }

  async updateBatchSort(items: { id: string; parentId: string | null; sort: number }[]) {
    for (const item of items) {
      const category = await this.categoryModel.findById(item.id);
      if (category) {
        let path = ',';
        if (item.parentId) {
          const parent = await this.categoryModel.findById(item.parentId);
          if (parent) {
            path = `${parent.path}${parent._id},`;
          }
        }
        await this.categoryModel.findByIdAndUpdate(item.id, {
          parentId: item.parentId,
          sort: item.sort,
          path,
        });
      }
    }
    return { success: true };
  }
}
