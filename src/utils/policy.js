import http from "@/utils/http";

export function policy() {
    return new Promise((resolve, reject) => {
        http({
            url: '/api/oss/policy',
            method: "post",
        }).then(({data}) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    });
}
