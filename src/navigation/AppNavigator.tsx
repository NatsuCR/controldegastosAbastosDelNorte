import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BarChart3, Home, Package, ReceiptText, Settings, ShoppingCart, Truck, TrendingDown } from 'lucide-react-native';

import { colores } from '../constants/tema';
import { CompraScreen } from '../screens/CompraScreen';
import { ConfiguracionScreen } from '../screens/ConfiguracionScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { GastosScreen } from '../screens/GastosScreen';
import { InventarioScreen } from '../screens/InventarioScreen';
import { ReportesScreen } from '../screens/ReportesScreen';
import { VentaScreen } from '../screens/VentaScreen';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSecundario,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarStyle: { minHeight: 62, paddingTop: 6 },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={22} /> }}
      />
      <Tab.Screen
        name="Venta"
        component={VentaScreen}
        options={{ tabBarIcon: ({ color }) => <ShoppingCart color={color} size={22} /> }}
      />
      <Tab.Screen
        name="Compra"
        component={CompraScreen}
        options={{ tabBarIcon: ({ color }) => <Truck color={color} size={22} /> }}
      />
      <Tab.Screen name="Gastos" component={GastosScreen} options={{
        title: 'Adicionales',
        tabBarIcon: ({ color, size }) => <TrendingDown color={color} size={size} />,
      }} />
      <Tab.Screen
        name="Reportes"
        component={ReportesScreen}
        options={{ tabBarIcon: ({ color }) => <BarChart3 color={color} size={22} /> }}
      />
      <Tab.Screen
        name="Inventario"
        component={InventarioScreen}
        options={{ tabBarIcon: ({ color }) => <Package color={color} size={22} /> }}
      />
      <Tab.Screen
        name="Configuracion"
        component={ConfiguracionScreen}
        options={{ tabBarIcon: ({ color }) => <Settings color={color} size={22} /> }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Principal" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
