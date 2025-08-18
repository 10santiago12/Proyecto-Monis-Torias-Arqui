const admin=require("firebase-admin");
const {UsersRepo}=require("../repos/users.repo");
const {TutorsRepo}=require("../repos/tutors.repo");

class UsersService {
  constructor({usersRepo=new UsersRepo(),tutorsRepo=new TutorsRepo()}={}) {
    this.users=usersRepo; this.tutors=tutorsRepo;
  }

  async ensureStudent(uid) {
    const roles=await this.users.getRoles(uid);
    if (roles&&roles.student===true) {return {uid,roles};}
    const merged=await this.users.mergeRoles(uid,{student:true});
    await setClaims(uid,merged);
    return {uid,roles:merged};
  }

  async upgradeToTutor(uid,code) {
    const entry=await this.tutors.claimCode(uid,code);
    const merged=await this.users.mergeRoles(uid,{tutor:true});
    await setClaims(uid,merged);
    // guardar perfil tutor básico
    await this.tutors.ensureTutorProfile(uid,{tutorCode:entry.code});
    return {uid,tutorCode:entry.code,roles:merged};
  }

  async setManager(uid,makeManager) {
    const merged=await this.users.mergeRoles(uid,{manager:!!makeManager});
    await setClaims(uid,merged);
    return {uid,roles:merged};
  }
}

async function setClaims(uid,roles) {
  await admin.auth().setCustomUserClaims(uid,{roles});
}

module.exports={UsersService};
