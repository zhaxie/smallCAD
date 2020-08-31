export default {
    state: {
        currentToolMode: null,
        sideToolList: [
            {
                model: 'drawRect',
                icon: "icon-rect",
            },
            {
                model: 'drawStraightLine',
                icon: "icon-zhixian",
            },
            // {
            //     icon: "icon-yuanhuxian",
            // },
            {
                model: 'drawCircular',
                icon: "icon-yuan",
            },
        ],

        currentUploadedImageInfo: {
            name: '',
            url: ''
        },
    },

    //切换当前的工具模式
    switchCurrentToolModel({ model }) {
        this.state.currentToolMode = model;
    },

    //上传文件
    handleUploadFile(e) {
        try {
            const file = e.target.files[0];
            var imageType = /image.*/;

            if (file.type.match(imageType)) {
                var reader = new FileReader();

                reader.readAsDataURL(file);
                reader.onload = () => {
                    this.state.currentUploadedImageInfo.name = file.name;
                    this.state.currentUploadedImageInfo.url = reader.result;
                };
            } else {
                alert('图片格式有误');
            }

            console.info("this.state.currentFileList", this.state.currentFileList);


        } catch (error) {
            console.error('error', error);
            alert(error);
        }
    },

    //删除上传了的文件
    removeUploadedImg() {
        const isSureRemove = confirm('确定删除？');

        if (isSureRemove === true) {
            this.state.currentUploadedImageInfo.name = '';
            this.state.currentUploadedImageInfo.url = '';
        }

    }
}