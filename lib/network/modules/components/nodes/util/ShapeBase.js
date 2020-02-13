import { prepareBoundingBox } from "../util/common";
import NodeBase from '../util/NodeBase'
import { getShape } from './shapes'

/**
 * Base class for constructing Node/Cluster Shapes.
 *
 * @extends NodeBase
 */
class ShapeBase extends NodeBase {
  /**
   * @param {Object} options
   * @param {Object} body
   * @param {Label} labelModule
   */
  constructor(options, body, labelModule) {
    super(options, body, labelModule)
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} [selected]
   * @param {boolean} [hover]
   * @param {Object} [values={size: this.options.size}]
   */
  resize(ctx, selected = this.selected, hover = this.hover, values = { size: this.options.size }) {
    if (this.needsRefresh(selected, hover)) {
      this.labelModule.getTextSize(ctx, selected, hover);
      var size = 2 * values.size;
      this.width = size;
      this.height = size;
      this.radius = 0.5*this.width;
    }
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} shape
   * @param {number} sizeMultiplier - Unused! TODO: Remove next major release
   * @param {number} x
   * @param {number} y
   * @param {boolean} selected
   * @param {boolean} hover
   * @param {ArrowOptions} values
   * @private
   */
  _drawShape(ctx, shape, sizeMultiplier, x, y, selected, hover, values) {
    this.resize(ctx, selected, hover, values);
    this.left = x - this.width / 2;
    this.top = y - this.height / 2;

    this.initContextForDraw(ctx, values);
    getShape(shape)(ctx, x, y, values.size);
    this.performFill(ctx, values);
    
    if (this.options.icon !== undefined) {
      if (this.options.icon.code !== undefined) {
        ctx.font = (selected ? "bold " : "")
            + (this.height / 2) + "px "
            + (this.options.icon.face || 'FontAwesome');
        ctx.fillStyle = this.options.icon.color || "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.options.icon.code, x, y);
      }
    }


    if (this.options.label !== undefined) {
      // Need to call following here in order to ensure value for `this.labelModule.size.height`
      this.labelModule.calculateLabelSize(ctx, selected, hover, x, y, 'hanging');  
      let {labelX, labelY, labelBaseline} = this.positionLabel(x, y);
      this.labelModule.draw(ctx, labelX, labelY, selected, hover, labelBaseline);
    }


    this.updateBoundingBox(x,y);
  }

  /**
   * 
   * @param {number} x
   * @param {number} y
   * @returns {{number,number,string}} 
   */
  positionLabel(x, y){
      let labelX = x;
      let labelY = y;
      let labelBaseline = 'middle';
      const distance = this.labelModule.distance;
      
      switch(this.labelModule.position){ 
        case 'inside': 
          break; 
        case 'left': 
          this.labelModule.fontOptions.align = 'right';
          labelX -= (this.labelModule.size.width + this.width) * 0.5 + distance; // shift left 
          break; 
        case 'right': 
          this.labelModule.fontOptions.align = 'left';
          labelX += (this.labelModule.size.width + this.width) * 0.5 + distance; // shift right    
          break; 
        case 'top': 
          labelY -= (this.labelModule.size.height + this.height) * 0.5 + distance; // shift up to above node 
          break; 
        default: 
          labelBaseline = 'top';
          labelY += (this.labelModule.size.height + this.height + distance) * 0.5; // shift down to below node 
      } 
      
      return { labelX, labelY, labelBaseline }
    
  }
}

export default ShapeBase;
