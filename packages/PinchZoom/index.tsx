import { Animated, LayoutRectangle, NativeMethods, NativeTouchEvent, PanResponder, ViewStyle } from 'react-native';
import React, {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useRef,
} from 'react';

type Props = PropsWithChildren<{
  style?: ViewStyle,
}>

type TouchePosition = Pick<NativeTouchEvent, 'locationX' | 'locationY' | 'pageX' | 'pageY'>

function getDistanceFromTouches(
  touches: NativeTouchEvent[],
): number {
  const [touch1, touch2] = touches;

  return Math.sqrt((touch1.pageX - touch2.pageX) ** 2 +
    (touch1.pageY - touch2.pageY) ** 2);
}

function getRelativeTouchesCenterPosition(
  touches: NativeTouchEvent[], layout: {width: number, height: number, pageX: number, pageY: number},
): TouchePosition {
  return {
    locationX: (touches[0].locationX + touches[1].locationX) / 2 - layout.width / 2,
    locationY: (touches[0].locationY + touches[1].locationY) / 2 - layout.height / 2,
    pageX: (touches[0].pageX + touches[1].pageX) / 2 - layout.width / 2 - layout.pageX,
    pageY: (touches[0].pageY + touches[1].pageY) / 2 - layout.height / 2 - layout.pageY,
  };
}

function PinchZoom(props: Props): ReactElement {
  const { style, children } = props;
  const containerView = useRef<NativeMethods>();
  const scale = useRef(new Animated.Value(1)).current;
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const transformCache = useRef({ scale: 1, translateX: 0, translateY: 0 }).current;
  const lastTransform = useRef({ scale: 1, translateX: 0, translateY: 0 });
  const initialDistance = useRef<number>();
  const initialTouchesCenter = useRef<TouchePosition>();
  const layout = useRef<{width: number, height: number, pageX: number, pageY: number}>();
  const decayingTranslateAnimation = useRef<Animated.CompositeAnimation>();

  containerView.current?.measure((x, y, width, height, pageX, pageY) => {
    layout.current = { width, height, pageX, pageY };
  });

  useEffect(() => {
    scale.addListener(({ value }) => { transformCache.scale = value; });

    const id = translate.addListener(({ x, y }) => {
      if (decayingTranslateAnimation.current && layout.current) {
        const overflowX = Math.abs(x) > (transformCache.scale - 1) * layout.current.width / 2;
        const overflowY = Math.abs(y) > (transformCache.scale - 1) * layout.current.height / 2;

        if (overflowX || overflowY) {
          decayingTranslateAnimation.current?.stop();
          decayingTranslateAnimation.current = undefined;

          translate.setValue({
            x: overflowX ? Math.sign(x) * (transformCache.scale - 1) * layout.current.width / 2 : x,
            y: overflowY ? Math.sign(y) * (transformCache.scale - 1) * layout.current.height / 2 : y,
          });
        }
      }

      transformCache.translateX = x;
      transformCache.translateY = y;
    });

    return () => {
      scale.removeAllListeners();
      translate.removeListener(id);
    };
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: ({ nativeEvent }) => {
        if (decayingTranslateAnimation.current) {
          decayingTranslateAnimation.current.stop();
        }

        const { touches } = nativeEvent;

        lastTransform.current = { ...transformCache };

        if (touches.length === 2 && layout.current != null) {
          initialDistance.current = getDistanceFromTouches(touches);
          initialTouchesCenter.current = getRelativeTouchesCenterPosition(touches, layout.current);
        } else {
          initialDistance.current = undefined;
        }
      },
      onPanResponderMove: ({ nativeEvent }, gestureState) => {
        const { touches } = nativeEvent;

        if (layout.current == null) {
          return;
        }

        if (touches.length === 2) {
          if (initialDistance.current && initialTouchesCenter.current && layout.current) {
            const newScale = Math.max(
              1,
              getDistanceFromTouches(touches) / initialDistance.current * lastTransform.current.scale,
            );

            const { pageX, pageY } = getRelativeTouchesCenterPosition(touches, layout.current);

            scale.setValue(newScale);

            const newTranslateX = pageX - (initialTouchesCenter.current.locationX * newScale);
            const newTranslateY = pageY - (initialTouchesCenter.current.locationY * newScale);

            translate.setValue({
              x: Math.min(Math.abs(newTranslateX), (newScale - 1) * layout.current.width / 2) *
                Math.sign(newTranslateX),
              y: Math.min(Math.abs(newTranslateY), (newScale - 1) * layout.current.height / 2) *
                Math.sign(newTranslateY),
            });
          } else {
            initialDistance.current = getDistanceFromTouches(touches);
            initialTouchesCenter.current = getRelativeTouchesCenterPosition(touches, layout.current);
          }
        } else if (touches.length === 1) {
          const newTranslateX = lastTransform.current.translateX + gestureState.dx;
          const newTranslateY = lastTransform.current.translateY + gestureState.dy;

          translate.setValue({
            x: Math.min(Math.abs(newTranslateX), (transformCache.scale - 1) * (layout.current.width / 2)) *
              Math.sign(newTranslateX),
            y: Math.min(Math.abs(newTranslateY), (transformCache.scale - 1) * (layout.current.width / 2)) *
              Math.sign(newTranslateY),
          });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        decayingTranslateAnimation.current = Animated.decay(
          translate,
          {
            velocity: { x: gestureState.vx, y: gestureState.vy },
            useNativeDriver: true,
          },
        );

        decayingTranslateAnimation.current.start(() => {
          decayingTranslateAnimation.current = undefined;
        });
      },
    }),
  ).current;

  return <Animated.View
    ref={containerView}
    style={[style, {
      transform: [
        { translateX: translate.x },
        { translateY: translate.y },
        { scale },
      ],
    }]}
    {...panResponder.panHandlers}
  >
    {children}
  </Animated.View>;
}

export default PinchZoom;
