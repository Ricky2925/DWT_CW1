import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider } from "react-redux";
import { store } from "./store/store";
import IndexPage from "./components/IndexPage";
import LoadingPage from "./components/LoadingPage";
import CameraPage from "./components/CameraPage";

// 定义导航参数类型
export type RootStackParamList = {
  Index: undefined;
  Loading: undefined;
  Camera: undefined;
};

// 创建 Stack Navigator，指定参数类型
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Index" id={undefined}>
          <Stack.Screen
            name="Index"
            component={IndexPage}
            options={{ title: "Safe Travel", headerTitleAlign: "center" }}
          />
          <Stack.Screen
            name="Loading"
            component={LoadingPage}
            options={{ title: "Loading", headerTitleAlign: "center" }}
          />
          <Stack.Screen
            name="Camera"
            component={CameraPage}
            options={{ title: "Camera", headerTitleAlign: "center" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
