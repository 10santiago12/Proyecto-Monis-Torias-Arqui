const {MaterialsRepo}=require("../repos/materials.repo");

class MaterialsService {
  constructor({materialsRepo=new MaterialsRepo()}={}) {this.repo=materialsRepo;}

  async requestUpload(user,dto) {
    const data={sessionId:dto.sessionId,filename:dto.filename,
      createdBy:user.uid,createdAt:new Date().toISOString()};
    const doc=await this.repo.create(data);
    const uploadUrl=`https://example.com/upload/${doc.id}`;
    return {materialId:doc.id,uploadUrl};
  }

  async getDownloadUrl(materialId) {
    const m=await this.repo.getById(materialId);
    if (!m) throw new Error("Material not found");
    const downloadUrl=`https://example.com/download/${materialId}`;
    return {downloadUrl};
  }
}

module.exports={MaterialsService};
