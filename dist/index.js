"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeManifest = exports.verifyManifestSignature = exports.verifyValidatorDomain = void 0;
const ripple_address_codec_1 = require("ripple-address-codec");
const ripple_keypairs_1 = require("ripple-keypairs");
const manifest_1 = __importDefault(require("./manifest"));
exports.verifyManifestSignature = manifest_1.default;
const network_1 = __importDefault(require("./network"));
const normalizeManifest_1 = require("./normalizeManifest");
Object.defineProperty(exports, "normalizeManifest", { enumerable: true, get: function () { return normalizeManifest_1.normalizeManifest; } });
/**
 * Verifies the signature and domain associated with a manifest.
 *
 * @param manifest - The signed manifest that contains the validator's domain.
 * @returns A verified, message, and the verified manifest.
 */
// eslint-disable-next-line max-lines-per-function -- Necessary use of extra lines.
function verifyValidatorDomain(manifest) {
    return __awaiter(this, void 0, void 0, function* () {
        const normalizedManifest = (0, normalizeManifest_1.normalizeManifest)(manifest);
        const domain = normalizedManifest.domain;
        const publicKey = normalizedManifest.master_key;
        const decodedPubKey = (0, ripple_address_codec_1.decodeNodePublic)(publicKey).toString('hex');
        if (!(0, manifest_1.default)(normalizedManifest)) {
            return {
                verified: false,
                verified_manifest_signature: false,
                message: 'Cannot verify manifest signature',
                manifest: normalizedManifest,
            };
        }
        if (domain === undefined) {
            return {
                verified: false,
                verified_manifest_signature: true,
                message: 'Manifest does not contain a domain',
                manifest: normalizedManifest,
            };
        }
        const validatorInfo = yield (0, network_1.default)(domain);
        if (!validatorInfo.VALIDATORS) {
            return {
                verified: false,
                verified_manifest_signature: true,
                message: 'Invalid .toml file',
                manifest: normalizedManifest,
            };
        }
        const message = `[domain-attestation-blob:${domain}:${publicKey}]`;
        const message_bytes = Buffer.from(message).toString('hex');
        const validators = validatorInfo.VALIDATORS.filter((validator) => validator.public_key === publicKey);
        if (validators.length === 0) {
            return {
                verified: false,
                verified_manifest_signature: true,
                message: '.toml file does not have matching public key',
                manifest: normalizedManifest,
            };
        }
        for (const validator of validators) {
            const attestation = Buffer.from(validator.attestation, 'hex').toString('hex');
            const failedToVerify = {
                verified: false,
                verified_manifest_signature: true,
                message: `Invalid attestation, cannot verify ${domain}`,
                manifest: normalizedManifest,
            };
            let verified;
            try {
                verified = (0, ripple_keypairs_1.verify)(message_bytes, attestation, decodedPubKey);
            }
            catch (_u) {
                return failedToVerify;
            }
            if (!verified) {
                return failedToVerify;
            }
        }
        return {
            verified: true,
            verified_manifest_signature: true,
            message: `${domain} has been verified`,
            manifest: normalizedManifest,
        };
    });
}
exports.verifyValidatorDomain = verifyValidatorDomain;
