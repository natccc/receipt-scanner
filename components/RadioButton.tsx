import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

type RadioButtonProps = {
  color: string;
  selected: boolean;
  onPress: () => void;
};

const RadioButton: React.FC<RadioButtonProps> = ({
  color,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.radioButton} onPress={onPress}>
      <View style={[styles.outerCircle, selected && { borderColor: color }]}>
        {selected && (
          <View style={[styles.innerCircle, { backgroundColor: color }]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  radioButton: {
    marginHorizontal: 12, 
  },
  outerCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
  },
});

export default RadioButton;
