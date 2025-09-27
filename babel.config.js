module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/hooks': './src/hooks',
            '@/services': './src/services',
            '@/utils': './src/utils',
            '@/store': './src/store',
            '@/assets': './src/assets',
            '@/types': './src/utils/types',
            '@/constants': './src/utils/constants',
            '@/helpers': './src/utils/helpers',
          },
        },
      ],
      'react-native-worklets/plugin',
    ],
  };
};
