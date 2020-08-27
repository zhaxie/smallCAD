export default {
    state: {
        currentToolModelType: 0,
        sideToolList: [
            {
                type: 0,
                icon: "icon-zhixian",
            },
            {
                type: 1,
                icon: "icon-yuanhuxian",
            },
            {
                type: 2,
                icon: "icon-yuan",
            },
        ],
        ruleTool: {
            currentModel: null,
        }
    },
    //切换当前的工具模式
    switchCurrentToolModel({ type }) {
        this.state.currentToolModelType = type;
    },
    switchDrawReferLineModel(model){
        this.state.ruleTool.currentModel = model;
    }
}