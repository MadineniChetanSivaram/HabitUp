'use strict';
import React from 'react';
import { View } from 'react-native-web';

export default function codegenNativeComponent(componentName, options) {
  const Component = React.forwardRef((props, ref) => {
    return React.createElement(View, { ...props, ref });
  });
  Component.displayName = componentName || 'NativeComponent';
  return Component;
}
