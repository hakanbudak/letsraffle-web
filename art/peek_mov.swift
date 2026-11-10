import AVFoundation
import ImageIO
import UniformTypeIdentifiers
import Foundation
let a = CommandLine.arguments
let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let gen = AVAssetImageGenerator(asset: asset)
gen.requestedTimeToleranceBefore = .zero; gen.requestedTimeToleranceAfter = .zero
let img = try gen.copyCGImage(at: CMTime(value: CMTimeValue(Int(a[3])!), timescale: 30), actualTime: nil)
let dst = CGImageDestinationCreateWithURL(URL(fileURLWithPath: a[2]) as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dst, img, nil); CGImageDestinationFinalize(dst)
print(img.width, img.height, img.alphaInfo.rawValue)
