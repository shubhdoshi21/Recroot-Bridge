import { Permission } from "../models/Permission.js";
import { UserPermission } from "../models/UserPermission.js";

export const getAllPermissions = async () => {
    return Permission.findAll();
};

export const getPermissionByName = async (name) => {
    return Permission.findOne({ where: { name } });
};

export const getRolePermissions = async (role) => {
    const rolePermissions = await UserPermission.findAll({
        where: { role },
        include: [{ model: Permission, attributes: ["id", "name"] }],
        order: [["grantedAt", "DESC"]],
    });
    return rolePermissions.map((rp) => rp.Permission && rp.Permission.name);
};

export const setPermissionsForRole = async (role, permissionNames, grantedBy) => {
    const permissions = await Permission.findAll({ where: { name: permissionNames } });
    const permissionIds = permissions.map((p) => p.id);
    await UserPermission.destroy({ where: { role } });
    for (const permissionId of permissionIds) {
        await UserPermission.create({ role, permissionId, grantedBy, grantedAt: new Date() });
    }
    return { success: true, role, permissionNames };
};

export const grantRolePermission = async (role, permissionName, grantedBy) => {
    let permission = await Permission.findOne({ where: { name: permissionName } });
    if (!permission) {
        permission = await Permission.create({ name: permissionName });
    }
    const existing = await UserPermission.findOne({ where: { role, permissionId: permission.id } });
    if (existing) return existing;
    return UserPermission.create({
        role,
        permissionId: permission.id,
        grantedBy,
        grantedAt: new Date(),
    });
};

export const revokeRolePermission = async (role, permissionName) => {
    const permission = await Permission.findOne({ where: { name: permissionName } });
    if (!permission) throw new Error("Permission not found");
    const deletedCount = await UserPermission.destroy({ where: { role, permissionId: permission.id } });
    return { success: true, deletedCount };
}; 