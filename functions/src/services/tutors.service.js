const {TutorsRepo}=require("../repos/tutors.repo");

class TutorsService{
  constructor({tutorsRepo=new TutorsRepo()}={}){this.tutors=tutorsRepo;}

  async createTutorCode(managerUid,note){
    // genera código único y guarda disponible
    const entry=await this.tutors.createCode(managerUid,note||"");
    return entry;
  }
}

module.exports={TutorsService};
