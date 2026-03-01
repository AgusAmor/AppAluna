import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import { fonts } from "../../theme";

/**
 * Select Component
 * Reusable dropdown select component for filtering and form inputs
 * Similar to FamilySelect but generic for any options
 *
 * @param {*} value - Currently selected value
 * @param {function} onChange - Callback when value changes
 * @param {array} options - Array of {label, value} objects
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Whether the select is disabled
 * @param {object} colorScheme - Theme color scheme
 * @param {boolean} hasError - Whether to show error styling
 * @param {string} label - Label text above the select
 * @param {object} valueColorMap - Optional map of values to {backgroundColor, textColor}
 */
const Select = ({
  value,
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  disabled = false,
  colorScheme,
  hasError = false,
  label,
  valueColorMap = {},
  openUpward = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [value, options]);

  // Get custom colors for selected value if available
  const selectedValueColors = useMemo(() => {
    return valueColorMap[value] || null;
  }, [value, valueColorMap]);

  const selectStyles = StyleSheet.create({
    container: {
      marginBottom: 0,
      zIndex: 1000,
    },
    label: {
      ...fonts.body.sm,
      color: colorScheme.primary,
      marginBottom: 4,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    button: {
      borderWidth: 1,
      borderColor: hasError ? colorScheme.error : colorScheme.border,
      borderRadius: 10,
      padding: 12,
      backgroundColor: colorScheme.backgroundLight,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      opacity: disabled ? 0.6 : 1,
    },
    buttonText: {
      ...fonts.body.base,
      color:
        selectedValueColors?.textColor ||
        (value ? colorScheme.text : colorScheme.textLight),
      fontWeight: "500",
      flex: 1,
    },
    dropdown: {
      position: "absolute",
      ...(openUpward
        ? { bottom: "100%", marginBottom: 2 }
        : { top: "100%", marginTop: 0 }),
      left: 0,
      right: 0,
      borderWidth: 1,
      borderColor: colorScheme.border,
      borderRadius: 10,
      ...(openUpward
        ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
        : { borderTopLeftRadius: 0, borderTopRightRadius: 0 }),
      backgroundColor: colorScheme.backgroundLight,
      overflow: "hidden",
      zIndex: 1001,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: openUpward ? -4 : 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    optionsContainer: {
      paddingVertical: 4,
    },
    option: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.border + "20",
    },
    optionText: {
      ...fonts.body.base,
      fontWeight: "500",
    },
    optionActive: {
      backgroundColor: colorScheme.accent + "20",
    },
  });

  return (
    <View style={selectStyles.container}>
      {label && <Text style={selectStyles.label}>{label}</Text>}

      <TouchableOpacity
        style={selectStyles.button}
        onPress={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <Text style={selectStyles.buttonText}>
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown
          size={20}
          color={selectedValueColors?.textColor || colorScheme.text}
          style={{ opacity: isOpen ? 0.6 : 1 }}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={selectStyles.dropdown}>
          <ScrollView
            style={selectStyles.optionsContainer}
            scrollEnabled={options.length > 5}
            nestedScrollEnabled={true}
          >
            {options.map((option) => {
              const optionColors = valueColorMap[option.value];
              const isSelected = option.value === value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    selectStyles.option,
                    isSelected &&
                      (optionColors
                        ? { backgroundColor: optionColors.backgroundColor }
                        : selectStyles.optionActive),
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <Text
                    style={[
                      selectStyles.optionText,
                      {
                        color: isSelected
                          ? optionColors?.textColor || colorScheme.accent
                          : colorScheme.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default Select;
