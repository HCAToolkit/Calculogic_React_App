import { VALIDATOR_REPORT_CAPTURE_PRESETS } from './validator-registry.knowledge.mjs';

export const listValidatorReportCapturePresets = () =>
  VALIDATOR_REPORT_CAPTURE_PRESETS.map((preset) => ({
    ...preset,
    capture: { ...preset.capture },
    wrappedCommand: {
      ...preset.wrappedCommand,
      args: [...preset.wrappedCommand.args],
    },
  }));

export const getValidatorReportCapturePresetByScriptName = (scriptName) =>
  listValidatorReportCapturePresets().find((preset) => preset.scriptName === scriptName) ?? null;

export const buildReportCapturePackageScript = (preset) => {
  const jsonFlag = preset.capture.json ? ' --json' : '';
  const wrappedCommand = [preset.wrappedCommand.executable, ...preset.wrappedCommand.args].join(
    ' ',
  );

  return `${preset.capture.captureCommand}${jsonFlag} --dir ${preset.capture.dir} --keep ${preset.capture.keep} --prefix ${preset.capture.prefix} -- ${wrappedCommand}`;
};
