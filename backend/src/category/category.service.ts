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

    return this.buildTree(categories);
  }

  private buildTree(categories: any[], parentId: string | null = null) {
    const tree = [];
    for (const category of categories) {
      const categoryParentId = category.parentId ? category.parentId.toString() : null;
      const targetParentId = parentId ? parentId.toString() : null;

      if (categoryParentId === targetParentId) {
        const children = this.buildTree(categories, category._id);
        if (children.length > 0) {
          category.children = children;
        }
        tree.push(category);
      }
    }
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
