<template>
    <el-form label-width="100px">
        <el-form-item label="SPU名称">
            <el-input placeholder="请你输入SPU的名称" v-model="SpuParams.spuName" />
        </el-form-item>
        <el-form-item label="SPU品牌">
            <el-select v-model="SpuParams.tmId">
                <el-option v-for="(item, $index) in AllTradeMark" :key="item.id" :label="item.tmName"
                    :value="item.id"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="SPU描述">
            <el-input type="textarea" placeholder="请你输入SPU的描述" v-model="SpuParams.description"></el-input>
        </el-form-item>
        <el-form-item label="SPU图片">
            <el-upload v-model:file-list="imgList" action="/api/admin/product/fileUpload" list-type="picture-card"
                :on-preview="handlePictureCardPreview" :on-remove="handleRemove" :before-upload="handleUpload">
                <el-icon>
                    <Plus />
                </el-icon>
            </el-upload>
            <el-dialog v-model="dialogVisible">
                <img w-full :src="dialogImageUrl" style="width:100%;height:100%;" />
            </el-dialog>
        </el-form-item>
        <el-form-item label="SPU销售属性">
            <!--展示销售属性的下拉菜单-->
            <el-select v-model="saleAttrIdAndValueName"
                :placeholder="unSelectSaleAttr.length ? `还未选择${unSelectSaleAttr.length}个:` : '无'">
                <el-option :value="`${item.id}:${item.name}`" v-for="(item, index) in unSelectSaleAttr" :key="item.id"
                    :label="item.name"></el-option>
            </el-select>
            <el-button :disabled="saleAttrIdAndValueName?false:true" style="margin-left:10px" type="primary" size="default" icon="Plus" @click="addSaleAttr">添加属性</el-button>
            <!--table展示销售属性与属性值的地方-->
            <el-table border style="margin: 10px 0px;" :data="saleAttr">
                <el-table-column label="序号" type="index" align="center" width="80px" />
                <el-table-column label="属性名" width="120px" prop="saleAttrName" />
                <el-table-column label="属性值">
                    <template #="{ row, $index }">
                        <el-tag style="margin: 0px 5px;" v-for="(item, index) in row.spuSaleAttrValueList" :key="row.id"
                            class="mx-1" closable>
                            {{ item.saleAttrValueName }}
                        </el-tag>
                        <el-button type="primary" size="small" icon="Plus"></el-button>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120px">
                    <template #="{ row, $index }">
                        <el-button type="primary" size="small" icon="Delete"
                            @click="saleAttr.splice($index, 1)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" size="default">保存</el-button>
            <el-button type="primary" size="default" @click="cancel">取消</el-button>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import type { Trademark, SpuData, AllTradeMark, SpuHasImg, SaleAttrResponseData, HasSaleAttrResponseData, SpuImg, SaleAttr, HasSaleAttr } from '@/api/product/spu/type';
import { reqAllTradeMark, reqSpuImageList, reqSpuHasSaleAttr, reqALLSaleAttr } from '@/api/product/spu';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
let $emit = defineEmits(['changeScene']);

//通知父组件切换场景为1
const cancel = () => {
    $emit('changeScene', 0);
}

//存储已有的SPU这些数据
let AllTradeMark = ref<Trademark[]>([]);
let imgList = ref<SpuImg[]>([]);
let saleAttr = ref<SaleAttr[]>([]);
let allSaleAttr = ref<HasSaleAttr[]>([]);
let dialogVisible = ref<boolean>(false);
let dialogImageUrl = ref<string>("");
let saleAttrIdAndValueName = ref<string>("");
//存储已有的SPU对象
let SpuParams = ref<SpuData>({
    category3Id: "",
    spuName: "",
    description: "",
    tmId: "",
    spuImageList: [],
    spuSaleAttrList: []
});
//子组件书写一个方法
const initHasSpuData = async (spu: SpuData) => {
    //存储已有的SPU对象
    SpuParams.value = spu;
    //spu：即为父组件传递过来的已有的SPU对象【不完整】
    //获取全部的品牌的数据
    let result: AllTradeMark = await reqAllTradeMark();
    //获取某一个品牌旗下的全部售卖商品的图片
    let result1: SpuHasImg = await reqSpuImageList((spu.id) as number);
    //获取已有的SPU销售属性的数据
    let result2: SaleAttrResponseData = await reqSpuHasSaleAttr((spu.id) as number);
    //获取整个项目全部SPU的销售属性
    let result3: HasSaleAttrResponseData = await reqALLSaleAttr();
    //存储全部品牌的数据
    AllTradeMark.value = result.data;
    //SPU对应的商品图片
    imgList.value = result1.data.map(item => {
        return {
            name: item.imgName,
            url: item.imgUrl
        }
    });
    //存储已有的SPU已有的销售属性
    saleAttr.value = result2.data;
    //存储全部的销售属性
    allSaleAttr.value = result3.data;
}

//照片墙点击预览触发的钩子
const handlePictureCardPreview = (file: any) => {
    dialogImageUrl.value = file.url;
    //对话框弹出
    dialogVisible.value = true
}

const handleRemove = () => {

}

const handleUpload = (file: any) => {
    if (file.type == 'image/png' || file.type == 'image/jpeg' || file.type == 'image/gif') {
        if (file.size / 1024 / 1024 < 3) {
            return true;
        } else {
            ElMessage({
                type: 'error',
                message: '上传的文件务必小于3M'
            })
            return false;
        }
    } else {
        ElMessage({
            type: 'error',
            message: '上传的文件务必是PNG|JPG|GIF'
        })
        return false;
    }
}

let unSelectSaleAttr = computed(() => {
    let unselectArr = allSaleAttr.value.filter(item => {
        return saleAttr.value.every(item1 => {
            return item.name != item1.saleAttrName;
        });
    });
    return unselectArr;
})

const addSaleAttr = () => {
    const [baseSaleAttrId, saleAttrName] = saleAttrIdAndValueName.value.split(':');
    let newSaleAttr:SaleAttr = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: []
    }
    //追加到数组当中
    saleAttr.value.push(newSaleAttr);
    //清空收集的数据
    saleAttrIdAndValueName.value = '';
}

//对外暴露
defineExpose({ initHasSpuData })
</script>

<style scoped></style>