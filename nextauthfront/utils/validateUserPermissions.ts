
type User = {
    permissions: string[];
    roles: string[];
}

type ValidateUserPermissionsParams = {
    user: User;
    permissions?: string[];
    roles?: string[];

}

export function validateUserPermissions({
    user,
    permissions,
    roles
}: ValidateUserPermissionsParams) {


    if (typeof permissions != 'undefined' && permissions?.length > 0) {
        //every returna true caso TODAS as condições sejam verdadeiras
        //some returna true caso ALGUMA as condições sejam verdadeiras
        const hasAllpermissions = permissions.some(permission => {
            return user.permissions.includes(permission)
        })

        if (!hasAllpermissions) {
            return false;
        }
    }

    if (typeof roles != 'undefined' && roles?.length > 0) {
        const hasAllRoles = roles.some(role => {
            return user.roles.includes(role)
        })

        if (!hasAllRoles) {
            return false;
        }
    }

    return true;
}