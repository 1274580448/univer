import { Component, createRef, IconComponent, JSXComponent, RefObject } from '@univerjs/base-component';
import { CanvasIcon } from '../CanvasIcon';

interface IProps {
    width?: string;
    height?: string;
}
interface IState {}

class BorderDashDotDot extends Component<IProps, IState> {
    ref = createRef();

    drawLine(ref: RefObject<CanvasIcon>) {
        const canvas = ref.current! as unknown as HTMLCanvasElement;
        let ctx = canvas.getContext('2d')!;
        this.ref.current.setLineDash(ctx, 'DashDotDot', 'h', 0, 5, 100, 5);
        ctx.stroke();
        ctx.closePath();
    }

    render() {
        const { width = '100', height = '10' } = this.props;
        return <CanvasIcon ref={this.ref} width={width} height={height} drawLine={(dom) => this.drawLine(dom)} />;
    }
}

export class UniverBorderDashDotDot implements IconComponent {
    render(): JSXComponent<IProps> {
        return BorderDashDotDot;
    }
}

export default BorderDashDotDot;
