import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function NotFoundScreen(){const{colors}=useTheme();return <View style={[styles.screen,{backgroundColor:colors.bg}]}><View style={[styles.icon,{backgroundColor:`${colors.primary}15`}]}><Ionicons name="planet-outline" size={58} color={colors.primary}/></View><Text style={[styles.title,{color:colors.text}]}>Không tìm thấy trang</Text><Text style={[styles.body,{color:colors.muted}]}>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</Text><Pressable onPress={()=>router.replace("/tabs")} style={[styles.button,{backgroundColor:colors.primary}]}><Text style={styles.buttonText}>Quay về trang chủ</Text></Pressable></View>}
const styles=StyleSheet.create({screen:{flex:1,alignItems:"center",justifyContent:"center",padding:30},icon:{width:112,height:112,borderRadius:56,alignItems:"center",justifyContent:"center"},title:{fontSize:20,fontWeight:"800",marginTop:22},body:{fontSize:11,lineHeight:18,textAlign:"center",marginTop:8,maxWidth:260},button:{height:48,paddingHorizontal:26,borderRadius:12,alignItems:"center",justifyContent:"center",marginTop:22},buttonText:{color:"#FFF",fontSize:12,fontWeight:"800"}});
